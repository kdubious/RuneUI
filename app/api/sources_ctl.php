<?php 
/*
 * Copyright (C) 2013-2014 RuneAudio Team
 * http://www.runeaudio.com
 *
 * RuneUI
 * copyright (C) 2013-2014 - Andrea Coiutti (aka ACX) & Simone De Gregori (aka Orion)
 *
 * RuneOS
 * copyright (C) 2013-2014 - Simone De Gregori (aka Orion) & Carmelo San Giovanni (aka Um3ggh1U)
 *
 * RuneAudio website and logo
 * copyright (C) 2013-2014 - ACX webdesign (Andrea Coiutti)
 *
 * This Program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3, or (at your option)
 * any later version.
 *
 * This Program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with RuneAudio; see the file COPYING.  If not, see
 * <http://www.gnu.org/licenses/gpl-3.0.txt>.
 *
 *  file: app/sources_ctl.php
 *  version: 1.3
 *  coder: Simone De Gregori
 *
 */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // get the data that was POSTed
    $postData = file_get_contents("php://input");
    // convert to an associative array
    $json = json_decode($postData, true); 
    
    if ($json['updatempd'] == true) {
        sendMpdCommand($mpd, 'update');
        return;
    }
    
    if ($json['mountall'] == true) {
        $jobID = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'sourcecfg', 'action' => 'mountall' ));
        //waitSyWrk($redis, $jobID);
        return ;
    }
	
	if ($json['source-umount']) {
        $jobID = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'sourcecfg', 'action' => 'delete', 'args' => $json['mount']));
        //waitSyWrk($redis, $jobID);
        return;
    }
    
    if ($json['usb-umount']) {
        $jobID = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'sourcecfg', 'action' => 'umountusb', 'args' => $json['usb-umount']));
        //waitSyWrk($redis, $jobID);
        return;
    }
    
    if ($json['mount']) {
        $json['mount']['remotedir'] = str_replace('\\', '/', $json['mount']['remotedir']);
        if ($json['mount']['rsize'] == '') $json['mount']['rsize'] = 16384;
        if ($json['mount']['wsize'] == '') $json['mount']['wsize'] = 17408;
        if ($json['mount']['options'] == '') {
            if ($json['mount']['type'] === 'cifs' OR $json['mount']['type'] === 'osx') {
                $json['mount']['options'] = "cache=none,noserverino,ro";
            } else {
                $json['mount']['options'] = "nfsvers=3,ro";
            }
        }
        if ($json['mount']['id'] == '0') {
			// Add
			$jobID = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'sourcecfg', 'action' => 'add', 'args' => $json['mount']));	
		} else {
			// Edit
			$jobID = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'sourcecfg', 'action' => 'edit', 'args' => $json['mount']));	
		}
    }
	
	// TODO : reset
	// if ($json['action'] == 'reset') $jobID = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'sourcecfgman', 'action' => 'reset' ));
    
    //waitSyWrk($redis, $jobID);

} else {

    // GET

    $id = $template->arg; // null when the id = 0
    $source = netMounts($redis, 'read');

    if ($id === NULL) {
        // Getting the Sources list

        // Disk Mounts
        
        if($source !== true) { 
            foreach ($source as $mp) {
                if (wrk_checkStrSysfile('/proc/mounts', '/mnt/MPD/NAS/'.$mp['name'])) {
                    $mp['status'] = true;
                } else {
                    $mp['status'] = false;
                }
                $mounts[]=$mp;
            }
        }
        $template->mounts = $mounts;

        // USB Mounts
        $usbmounts = $redis->hGetAll('usbmounts');
        foreach ($usbmounts as $usbmount) {
            $template->usbmounts[] = json_decode($usbmount);
        }
        // we still want the property sent to the UI
        if (isset($template->usbmounts)===FALSE) {
            $template->usbmounts = NULL; 
        }


    } else if ($id === '0') {
        // GET to setup a New Source
        $mount = new stdClass();
        $mount->id = 0;
        $mount->name = '';
        $mount->address = '';
        $mount->type = '';
        $mount->remotedir = '';
        $mount->username = '';
        $mount->password = '';
        
        $template->mount = $mount;

    } else if ($id > 0) {
        // GET to Edit Existing
        //$template->mount = NULL;
        foreach ($source as $mp) {
            if ($mp['id'] == $id) {
                $template->mount = $mp;
            }
        }

       
        if (isset($template->mount)===FALSE) {
            // we were sent a bad ID in the URL
            $template->errormsg = 'The selected mount does not exist.'; // [TODO] pass the localized string ID
            http_response_code(400); // HTTP : Bad Request
        }
    }

    //if (isset($template->action)) {
    //    if (isset($template->arg)) {
    //        foreach ($source as $mp) {
    //            if ($mp['id'] == $template->arg) {
    //                $template->mount = $mp;
    //            }
    //        }
    //        $template->title = 'Edit network mount';
    //    } else {
    //        $template->title = 'Add new network mount';
    //    }
    //} 
        
}
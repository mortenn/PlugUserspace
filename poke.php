<?php
	$secret = file_get_contents('../.github-secret');
	$data = file_get_contents('php://input');
	list($algo, $hash) = explode('=', $_SERVER['HTTP_X_HUB_SIGNATURE'], 2) + array('', '');
	if($hash != hash_hmac($algo, $rawPost, $hookSecret))
	{
		header('HTTP/1.0 403 Forbidden');
		die('Invalid secret');
	}
	echo `git pull 2>&1`;

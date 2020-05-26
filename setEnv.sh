#!/bin/bash

export APP_ID=`cat /usr/local/docker-config/APP_ID_HEX`
export RESOURCE_ID=`cat  /usr/local/docker-config/RESOURCE_ID_HEX`
export AUTH0_CLIENT_ID=`cat /usr/local/docker-config/httpd/psamaui_settings.json | grep client_id | cut -d &apos;:&apos; -f 2 | sed &apos;s/\&quot;,*//g&apos;`


sed -i "s/__STACK_SPECIFIC_APPLICATION_ID__/$APP_ID/g" ui/src/main/resources/picsureui/settings/settings.json
sed -i "s/__STACK_SPECIFIC_RESOURCE_UUID__/$RESOURCE_ID/g" ui/src/main/resources/picsureui/settings/settings.json
sed -i "s/__AUTH0_CLIENT_ID__/$AUTH0_CLIENT_ID/g" ui/src/main/resources/psamaui/settings/settings.json

export PSAMA_SETTINGS_VOLUME=""
export PICSURE_SETTINGS_VOLUME=""



use auth;

-- Delete

delete from userMetadataMapping;

delete from role_privilege;

delete from user_role;

delete from user;

delete from connection;

delete from role;

delete from privilege;

delete from application;

-- Insert

-- Application
insert into application (uuid, description, enable, name, token, url)  values (0x5CEF84DF56EA4F11A7351C61D9FF8F43, 'i2b2/tranSMART application', 0x01, 'TRANSMART', 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJQU0FNQV9BUFBMSUNBVElPTnw1Y2VmODRkZi01NmVhLTRmMTEtYTczNS0xYzYxZDlmZjhmNDMiLCJleHAiOjE1ODU2Nzc0MTEsInVzZXJfaWQiOiJQU0FNQV9BUFBMSUNBVElPTnxUUkFOU01BUlQiLCJpYXQiOjE1NTQxNDE0MTF9.8fpMpXj7bU6VUhyUeR6FrGata3OQWyM-940RzxHOYaM', '/transmart/login/' );
insert into application (uuid, description, enable, name, token, url)  values (0x807BEBC921C04DB49D841F68D80778E1, 'PIC-SURE application includes IRCT, PICSURE2', 0x01, 'pic-sure', 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJQU0FNQV9BUFBMSUNBVElPTnw4MDdiZWJjOS0yMWMwLTRkYjQtOWQ4NC0xZjY4ZDgwNzc4ZTEiLCJpc3MiOiJiYXIiLCJleHAiOjE2MTcxMDk3MjEsImlhdCI6MTU4NTU3MzcyMSwianRpIjoiRm9vIn0.gy-2TVPXTYyadwI8huxJh3UIBozEKVpsvUimMVwMSsM', '/picsureui' );

-- Privilege
insert into privilege (uuid, description, name, application_id, queryTemplate)  values (0x13EE819DBAE1416CB9805BD45B3B193A, 'Execute patient count queries against PrecisionLink i2b2 instance.', 'PIC-SURE-USER', 0x807BEBC921C04DB49D841F68D80778E1, null );
insert into privilege (uuid, description, name, application_id, queryTemplate)  values (0x3ECFF6B381944D2395DE3D1A72D94646, 'Level2 level access for i2b2/tranSMART application', 'TM_DATASET_EXPLORER_ADMIN', 0x5CEF84DF56EA4F11A7351C61D9FF8F43, null );
insert into privilege (uuid, description, name, application_id, queryTemplate)  values (0x528C2EA9FED94634BF6BEC6DBD102743, 'PIC-SURE Auth admin for managing users', 'ADMIN', null, null );
insert into privilege (uuid, description, name, application_id, queryTemplate)  values (0x54F343125FC44F45B31FDA32C7A07B68, 'PIC-SURE Auth super admin for managing roles/privileges/application', 'SUPER_ADMIN', null, null );
insert into privilege (uuid, description, name, application_id, queryTemplate)  values (0x6CBC73FA75C940749FB8643DE5AD01C2, 'Level0 level access for i2b2/tranSMART application', 'TM_PUBLIC_USER', 0x5CEF84DF56EA4F11A7351C61D9FF8F43, null );
insert into privilege (uuid, description, name, application_id, queryTemplate)  values (0x759C94D22784451B8073FF3C1E7F7FE9, 'System Admin Privilege for PICSURE2', 'ROLE_SYSTEM', 0x807BEBC921C04DB49D841F68D80778E1, null );
insert into privilege (uuid, description, name, application_id, queryTemplate)  values (0xB6A24F53B9584E028739B8362C7793BF, 'Admin level access for i2b2/tranSMART application', 'TM_ADMIN', 0x5CEF84DF56EA4F11A7351C61D9FF8F43, null );
insert into privilege (uuid, description, name, application_id, queryTemplate)  values (0xD1A294722BE44757A65A4558F73E4481, 'Level1 level access for i2b2/tranSMART application', 'TM_STUDY_OWNER', 0x5CEF84DF56EA4F11A7351C61D9FF8F43, null );

-- Role
insert into role (uuid, name, description)  values (0x176C34008B04424B86CB8B97AD8F4E78, 'PIC-SURE Top Admin', 'PIC-SURE Top Admin' );
insert into role (uuid, name, description)  values (0x8F096EC4505B4359A4972F051C1B420A, 'Research User', 'Can run patient count queries and search for concepts.' );
insert into role (uuid, name, description)  values (0xE8187F5561B84F3BBE5589EB04EC9B6F, 'Regular Admin', 'For managing users in management console' );

-- Connection
insert into connection (uuid, label, id, subprefix, requiredFields)  values (0x37604AA86C9611E9A65E0EDC9CE15A6A, 'BCH', 'ldap-connector', 'ad|ldap-connector', '[{"label":"BCH Email","id":"email"}]' );
insert into connection (uuid, label, id, subprefix, requiredFields)  values (0xDC690B1A518A11E9A65E0EDC9CE15A6A, 'Google', 'google-oauth2', 'google-oauth2|', '[{"label":"Email", "id":"email"}]' );

-- Role Privilege
insert into role_privilege (role_id, privilege_id)  values (0x8F096EC4505B4359A4972F051C1B420A, 0x13EE819DBAE1416CB9805BD45B3B193A);
insert into role_privilege (role_id, privilege_id)  values (0x176C34008B04424B86CB8B97AD8F4E78, 0x528C2EA9FED94634BF6BEC6DBD102743);
insert into role_privilege (role_id, privilege_id)  values (0xE8187F5561B84F3BBE5589EB04EC9B6F, 0x528C2EA9FED94634BF6BEC6DBD102743);
insert into role_privilege (role_id, privilege_id)  values (0x176C34008B04424B86CB8B97AD8F4E78, 0x54F343125FC44F45B31FDA32C7A07B68);
insert into role_privilege (role_id, privilege_id)  values (0x8F096EC4505B4359A4972F051C1B420A, 0x6CBC73FA75C940749FB8643DE5AD01C2);
insert into role_privilege (role_id, privilege_id)  values (0x176C34008B04424B86CB8B97AD8F4E78, 0x759C94D22784451B8073FF3C1E7F7FE9);
insert into role_privilege (role_id, privilege_id)  values (0x176C34008B04424B86CB8B97AD8F4E78, 0xB6A24F53B9584E028739B8362C7793BF);
insert into role_privilege (role_id, privilege_id)  values (0x8F096EC4505B4359A4972F051C1B420A, 0xD1A294722BE44757A65A4558F73E4481);

-- UserMetadata Mapping
insert into userMetadataMapping (uuid, auth0MetadataJsonPath, connectionId, generalMetadataJsonPath)  values (0x51A72A886C9711E9A65E0EDC9CE15A6A, '$.email', 0x37604AA86C9611E9A65E0EDC9CE15A6A, '$.email');
insert into userMetadataMapping (uuid, auth0MetadataJsonPath, connectionId, generalMetadataJsonPath)  values (0xDC760FF4518A11E9A65E0EDC9CE15A6A, '$.email', 0xDC690B1A518A11E9A65E0EDC9CE15A6A, '$.email');


commit;

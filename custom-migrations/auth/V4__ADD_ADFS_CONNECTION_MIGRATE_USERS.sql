use auth

-- Create the connection entity for BCH-ADFS

INSERT INTO `connection` VALUES (0xB6BD9D7F9E3311ECA5F4126ACB86EEFB, 'BCH-ADFS', 'BCH-ADFS','adfs|BCH-ADFS|','[{"label":"BCH Email", "id":"email"}]');

-- Create the userMetadataMapping for BCH-ADFS

INSERT INTO `userMetadataMapping` VALUES 
(unhex('24FD002DC322B0D8420F338F885D0ED5'), '$.email', 0xB6BD9D7F9E3311ECA5F4126ACB86EEFB, '$.email');

-- These users were mistakenly created as duplicates, we don't delete users to preserve any audit trail, 
-- but we update their emails so they don't create email collisions during migration

update user set email=concat('unused_',email) where uuid=0x2C60584126304A88B1B2DF6F50B44611;
update user set email=concat('unused_',email) where uuid=0x1FE2AE8AB55E4626BE424C3C6B01F77C;
update user set email=concat('unused_',email) where uuid=0xB04F181FB4BC44548D962BC576EA9238;

-- Create an ADFS user for each of the ldap-connector users. 
-- We preserve the ability to roll back to the ldap-connector if necessary and also preserve the UUIDs for audit purposes

insert into user  (select UNHEX(REPLACE(uuid(), '-', '')), NULL, general_metadata, acceptedTOS, 0xB6BD9D7F9E3311ECA5F4126ACB86EEFB,email,0x00,NULL,is_active,NULL from user where lower(email) like "%childrens%");

-- Assign the same roles to the ADFS users that are assigned to the LDAP users

insert into user_role (select b.uuid new_uuid, role_id from (select * from user_role left join user on user_id=uuid where connectionId=0x37604AA86C9611E9A65E0EDC9CE15A6A)  a left join (select * from user where connectionId=0xB6BD9D7F9E3311ECA5F4126ACB86EEFB) b on lower( a.email)  like lower(b.email) where a.email like '%childrens%');



use abacus_db;
show tables;

select *
from user;

select *
from student;

select *
from batch;

select *
from course;

select id,name,courseId
from batch;

update batch
set courseId=1
where courseId is null;

select *
from inventory;

DESCRIBE User;

select *
from notification;




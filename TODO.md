# Admin Dashboard Connection - TODO

## Task
Connect the admin dashboard to display real user data from the database without changing existing functions.

## Changes Required

### 1. Update Dashboard Controller (server/src/dashboard/controller.py)
- [x] Query total users from User table
- [x] Query active users (status = 'active')
- [x] Query linked accounts count from Account table
- [x] Query alerts from Alert table
- [x] Calculate user growth trends from user creation dates
- [x] Get alert type distribution from Alert table
- [x] Get recent alerts from Alert table
- [x] Calculate growth rates

### 2. Ensure Database Models are Imported
- Use src/models/user.py for User and Account models (has first_name, last_name)
- Use src/alerts/models.py for Alert model

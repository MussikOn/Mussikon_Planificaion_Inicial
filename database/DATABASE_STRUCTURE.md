# Mussikon Database Structure

## Overview
This document describes the complete database structure for the Mussikon platform, including all tables, functions, triggers, and policies.

## Tables

### Core Tables
1. **users** - User accounts and profiles
   - id (UUID, Primary Key)
   - name (VARCHAR)
   - email (VARCHAR, Unique)
   - phone (VARCHAR)
   - role (VARCHAR: 'leader', 'musician', 'admin')
   - active_role (VARCHAR: 'leader', 'musician')
   - status (VARCHAR: 'active', 'pending', 'rejected')
   - church_name (VARCHAR)
   - location (VARCHAR)
   - created_at, updated_at (TIMESTAMP)

2. **user_passwords** - User authentication
   - id (UUID, Primary Key)
   - user_id (UUID, Foreign Key to users)
   - password (VARCHAR, hashed)
   - created_at (TIMESTAMP)

3. **user_instruments** - Musician instruments
   - id (UUID, Primary Key)
   - user_id (UUID, Foreign Key to users)
   - instrument (VARCHAR)
   - years_experience (INTEGER)
   - created_at (TIMESTAMP)

### Business Logic Tables
4. **requests** - Musical service requests
   - id (UUID, Primary Key)
   - leader_id (UUID, Foreign Key to users)
   - event_type (VARCHAR)
   - event_date (TIMESTAMP)
   - start_time (TIME)
   - end_time (TIME)
   - location (VARCHAR)
   - budget (DECIMAL)
   - description (TEXT)
   - required_instrument (VARCHAR)
   - status (VARCHAR: 'active', 'closed', 'cancelled')
   - created_at, updated_at (TIMESTAMP)

5. **offers** - Musician offers for requests
   - id (UUID, Primary Key)
   - request_id (UUID, Foreign Key to requests)
   - musician_id (UUID, Foreign Key to users)
   - proposed_price (DECIMAL)
   - availability_confirmed (BOOLEAN)
   - message (TEXT)
   - status (VARCHAR: 'pending', 'selected', 'rejected')
   - created_at, updated_at (TIMESTAMP)

6. **admin_actions** - Admin decision tracking
   - id (UUID, Primary Key)
   - admin_id (UUID, Foreign Key to users)
   - user_id (UUID, Foreign Key to users)
   - action (VARCHAR: 'approve', 'reject', 'pending')
   - reason (TEXT)
   - created_at (TIMESTAMP)

### Advanced Features Tables
7. **notifications** - User notifications
   - id (UUID, Primary Key)
   - user_id (UUID, Foreign Key to users)
   - title (VARCHAR)
   - message (TEXT)
   - type (VARCHAR)
   - read (BOOLEAN)
   - data (JSONB)
   - created_at, updated_at (TIMESTAMP)

8. **musician_availability** - Musician availability management
   - id (UUID, Primary Key)
   - musician_id (UUID, Foreign Key to users)
   - event_date (DATE)
   - start_time (TIME)
   - end_time (TIME)
   - is_blocked (BOOLEAN)
   - reason (TEXT)
   - created_at, updated_at (TIMESTAMP)

9. **pricing_config** - Dynamic pricing configuration
   - id (UUID, Primary Key)
   - base_hourly_rate (DECIMAL)
   - minimum_hours (DECIMAL)
   - maximum_hours (DECIMAL)
   - platform_commission (DECIMAL)
   - service_fee (DECIMAL)
   - tax_rate (DECIMAL)
   - currency (VARCHAR)
   - is_active (BOOLEAN)
   - created_at, updated_at (TIMESTAMP)

10. **user_balances** - User financial balances
    - id (UUID, Primary Key)
    - user_id (UUID, Foreign Key to users)
    - balance (DECIMAL)
    - currency (VARCHAR)
    - created_at, updated_at (TIMESTAMP)

11. **user_transactions** - Financial transaction history
    - id (UUID, Primary Key)
    - user_id (UUID, Foreign Key to users)
    - transaction_type (VARCHAR)
    - amount (DECIMAL)
    - description (TEXT)
    - reference_id (UUID)
    - created_at, updated_at (TIMESTAMP)

## Functions

### Utility Functions
1. **update_updated_at_column()** - Updates updated_at timestamp
2. **check_availability_conflict()** - Checks for availability conflicts
3. **block_availability_with_buffer()** - Blocks availability with travel buffer
4. **calculate_event_price()** - Calculates event pricing
5. **update_user_balance()** - Updates user balance

### Notification Functions
6. **create_notification()** - Creates a notification for a user
7. **notify_musicians_new_request()** - Notifies all musicians about new requests
8. **notify_leader_new_offer()** - Notifies leader about new offers
9. **notify_musician_offer_selected()** - Notifies musician about offer selection

## Triggers

### Updated At Triggers
- update_users_updated_at
- update_requests_updated_at
- update_offers_updated_at
- trigger_user_balances_updated_at
- trigger_user_transactions_updated_at

### Notification Triggers
- trigger_notify_musicians_new_request
- trigger_notify_leader_new_offer
- trigger_notify_musician_offer_selected

## Indexes

### Performance Indexes
- idx_users_email
- idx_users_role
- idx_users_status
- idx_requests_leader_id
- idx_requests_status
- idx_requests_required_instrument
- idx_offers_request_id
- idx_offers_musician_id
- idx_offers_status
- idx_user_instruments_user_id
- idx_admin_actions_user_id
- idx_notifications_user_id
- idx_notifications_read
- idx_notifications_created_at

## Row Level Security (RLS)

### Policies
- Users can read/update own data
- Public can read active requests
- Leaders can manage own requests
- Musicians can create/update own offers
- Leaders can update offers for their requests
- Admin can read/update all data
- Users can view their own notifications
- Musicians can manage their own availability
- Everyone can read active pricing config
- Users can view their own balance/transactions

## Default Data

### Admin Users
1. **admin@mussikon.com** - Default admin (password: admin123)
2. **jasbootstudios@gmail.com** - Jefry Astacio (password: P0pok@tepel01)

## Features Supported

### Core Features
- ✅ User registration and authentication
- ✅ Role-based access control (leader, musician, admin)
- ✅ Dynamic role switching for musicians
- ✅ Request creation and management
- ✅ Offer creation and management
- ✅ Admin user management
- ✅ Password management

### Advanced Features
- ✅ Real-time notifications
- ✅ Musician availability management
- ✅ Travel buffer system (1.5 hours)
- ✅ Dynamic pricing configuration
- ✅ User balance tracking
- ✅ Transaction history
- ✅ Row Level Security (RLS)
- ✅ WebSocket support

### Business Logic
- ✅ Musicians can only see their own offers
- ✅ Leaders can see all offers for their requests
- ✅ Admins have full access
- ✅ Automatic balance updates
- ✅ Availability conflict checking
- ✅ Price calculation with commissions

## Database Version
- **Version**: MVP 1.0
- **Last Updated**: 2024
- **Compatible with**: Supabase PostgreSQL
- **Extensions**: uuid-ossp

# Role, Hierarchy & RBAC Specification

## Objective

Define a **dynamic Role + Hierarchy System** combined with **Role-Based
Access Control (RBAC)** and a **Privilege Matrix**.\
All configuration must be stored in the **database**, not hardcoded in
the application.

This design supports enterprise-level access management for applications
such as KPI management, project management tools, or monitoring
dashboards.

------------------------------------------------------------------------

# 1. Organizational Hierarchy Model

The system must support a **4-level organizational hierarchy**.

| Level \| Role Name \| Description \|

\|------\|-----------\|-------------\| L1 \| Vice President /
Administrator \| Highest level. Can see all data in the system \| \| L2
\| Manager \| Can see data under their organizational structure \| \| L3
\| Assistant Manager (Asman) \| Can see data under their supervision \|
\| L4 \| Staff / Users \| Can only see their own data \|

### Hierarchy Rule

L1 → can see **L2, L3, L4**\
L2 → can see **L3, L4 (within their org)**\
L3 → can see **L4 (within their org)**\
L4 → can see **their own records only**

------------------------------------------------------------------------

# 2. Role Lookup Table

All roles must be stored in a **lookup table**.

## Table: lookup_roles

  Field             Type           Description
  ----------------- -------------- ------------------
  id                integer (PK)   role identifier
  role_code         varchar        unique role code
  role_name         varchar        display name
  hierarchy_level   integer        L1, L2, L3, L4
  is_active         boolean        role status
  created_at        timestamp      record creation
  updated_at        timestamp      record update

### Default Seed Data

  role_code   role_name       hierarchy_level
  ----------- --------------- -----------------
  ADMIN       Administrator   L1
  MANAGER     Managers        L2
  ASMAN       Asman           L3
  USER        Users           L4

------------------------------------------------------------------------

# 3. RBAC (Role Based Access Control)

RBAC determines **what each role is allowed to do**.

Access control must be implemented using **role-based permissions stored
in database tables**.

## Table: permissions

  Field             Type      Description
  ----------------- --------- ---------------
  id                integer   permission id
  permission_code   varchar   unique code
  permission_name   varchar   readable name

Example permissions:

  permission_code   permission_name
  ----------------- -----------------
  VIEW_DATA         View Data
  EDIT_DATA         Edit Data
  DELETE_DATA       Delete Data
  APPROVE_DATA      Approve Data

------------------------------------------------------------------------

# 4. Role Permission Mapping

Create a **mapping table** between roles and permissions.

## Table: role_permissions

  Field           Type      Description
  --------------- --------- -------------
  id              integer   
  role_id         integer   
  permission_id   integer   
  is_allowed      boolean   

This table determines whether a role has a specific permission.

------------------------------------------------------------------------

# 5. Privilege Matrix

The system should support the following privileges:

  Privilege   Description
  ----------- -----------------------------
  View        Read data
  Edit        Modify data
  Delete      Remove data
  Approve     Approve workflow or records

### Example Privilege Matrix

  Role                 View   Edit   Delete   Approve
  -------------------- ------ ------ -------- ---------
  Administrator (L1)   ✓      ✓      ✓        ✓
  Manager (L2)         ✓      ✓      ✗        ✓
  Asman (L3)           ✓      ✓      ✗        ✗
  Users (L4)           ✓      ✗      ✗        ✗

------------------------------------------------------------------------

# 6. User Table Integration

User records must reference a role.

## Table: users

  Field               Type        Description
  ------------------- ----------- -------------
  id                  integer     
  name                varchar     
  email               varchar     
  role_id             integer     
  organization_unit   varchar     
  created_at          timestamp   

------------------------------------------------------------------------

# 7. API Design

### Get Roles

GET /api/roles

Response

    [
      {
        "id": 1,
        "role_code": "ADMIN",
        "role_name": "Administrator",
        "hierarchy_level": "L1"
      }
    ]

------------------------------------------------------------------------

### Get Permissions for Role

GET /api/roles/{role_id}/permissions

------------------------------------------------------------------------

# 8. UI Behaviour

## User Form

Role field must:

• Load roles dynamically from database\
• Show only active roles\
• Display role_name\
• Save role_id

Example dropdown:

Administrator\
Managers\
Asman\
Users

------------------------------------------------------------------------

# 9. Admin Management Feature

Administrator must be able to:

• Create new roles\
• Edit roles\
• Disable roles\
• Assign permissions to roles\
• Manage privilege matrix

------------------------------------------------------------------------

# 10. Expected Result

The system must:

• Support enterprise hierarchy structure\
• Use database-driven roles\
• Implement RBAC security model\
• Support privilege matrix\
• Avoid hardcoded roles in application code

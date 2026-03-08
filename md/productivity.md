# Daily Productivity Module -- Audit & Improvement Summary

## Overview

The **Daily Productivity** dashboard currently lacks meaningful insights
and functional data visualization. Several UI and data issues prevent
users from understanding team productivity and workload distribution.

This document summarizes the key problems and the recommended
improvements for the module.

------------------------------------------------------------------------

# Current Issues

## 1. Empty Productivity Chart

The productivity chart (Mon--Sat) displays no data.

Possible causes: - No connection to real data sources. - Missing
productivity dataset. - Chart rendering without fallback state.

Required behavior: - Pull productivity data from operational tables such
as: - schedules - tasks - timesheets - project activity logs

If no data exists, display: \> "No productivity data available for this
week."

------------------------------------------------------------------------

## 2. Lack of Clear Insights

The dashboard only shows: - **37.5h Weekly Hours Logged**

This number alone does not explain team performance.

The system should also provide: - Average daily productivity -
Utilization rate per employee - Comparison with previous week -
Overloaded team members - Underutilized team members

Example insight:

This week the team logged **37.5 hours**. Productivity peaked on
**Tuesday (95%)** indicating optimal utilization. **Friday (75%)** shows
the lowest activity suggesting underutilization.

------------------------------------------------------------------------

## 3. Workload Balance Calculation

Current message: \> 3 members 90% utilization, 2 members below 70%

However the calculation logic is unclear.

Workload balance must be computed dynamically using: - employee
assignments - task hours - logged timesheets

Example rules:

-   Overloaded: utilization \> 90%
-   Optimal: 70--90%
-   Underutilized: \< 70%

------------------------------------------------------------------------

## 4. UI Formatting Issue (Peak Day & Lowest Day)

Current UI problem:

    Tue95%
    Fri75%

Day and percentage appear merged.

Correct formatting:

Peak Day\
Tuesday --- 95%

Lowest Day\
Friday --- 75%

This requires separating UI components for: - day label - utilization
value

------------------------------------------------------------------------

## 5. Peak Day and Lowest Day Logic

These metrics should be calculated using daily productivity data.

Formula:

daily_utilization = total_logged_hours / total_available_hours

Example dataset:

\[ { "day": "Mon", "utilization": 82 }, { "day": "Tue", "utilization":
95 }, { "day": "Wed", "utilization": 88 }, { "day": "Thu",
"utilization": 91 }, { "day": "Fri", "utilization": 75 }, { "day":
"Sat", "utilization": 60 }\]

Peak Day = highest utilization\
Lowest Day = lowest utilization

------------------------------------------------------------------------

# Required Database Structures

## Timesheets Table

  Field          Description
  -------------- ----------------------
  id             Primary key
  employee_id    Employee reference
  project_id     Project reference
  task_id        Task reference
  hours_logged   Logged working hours
  date           Work date

## Productivity Daily Table

  Field              Description
  ------------------ ------------------------------
  id                 Primary key
  date               Productivity date
  total_hours        Total logged hours
  utilization_rate   Daily utilization percentage

------------------------------------------------------------------------

# Expected Final Outcome

The **Daily Productivity Dashboard** should:

-   Display real productivity data
-   Provide actionable insights
-   Show workload distribution clearly
-   Identify peak productivity days
-   Detect underutilization and overload risks

The dashboard must function as an **operational decision tool**, not
just a visual UI element.

------------------------------------------------------------------------

# Key Goal

Transform the current dashboard from a **static UI template** into a
**data-driven productivity monitoring system** that provides meaningful
operational insights for project and team management.

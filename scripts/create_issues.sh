#!/bin/bash

# Script to create GitHub issues from docs/task_breakdown.md
# Usage: ./scripts/create_issues.sh [--dry-run]

DRY_RUN=false
if [[ $1 == "--dry-run" ]]; then
    DRY_RUN=true
fi

REPO="ahamedzoha/shonchoy"
MARKDOWN_FILE="docs/task_breakdown.md"

# Function to clean string for labels
clean_label() {
    echo "$1" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//'
}

# Create labels
echo "Creating labels..."
labels=("high" "medium" "low" "lead-dev" "backend-dev" "designer" "devops-lead-dev" "frontend-dev" "full-stack-dev" "dev-team" "qa" "qa-product" "medium-v1-1" "qa-dev" "devops" "planning-setup" "backend-development" "frontend-development" "integration-features" "testing-qa" "deployment-launch" "post-mvp-iterations")
for label in "${labels[@]}"; do
    if $DRY_RUN; then
        echo "DRY RUN: gh label create \"$label\" --repo \"$REPO\""
    else
        gh label create "$label" --repo "$REPO" 2>/dev/null || echo "Label '$label' already exists"
    fi
done

# Parse the markdown and create issues
awk '
/^## / {
    phase_full = substr($0,4)
    sub(/\s*\([^)]*\)\s*$/, "", phase_full)
    sub(/^[^ ]* /, "", phase_full)
    phase = phase_full
    next
}
/^- \*\*Task / {
    if (task) print_task()
    task_line = $0
    sub(/^- \*\*/, "", task_line)
    sub(/\*\*$/, "", task_line)
    task = task_line
    desc = ""; deps = ""; assignee = ""; priority = ""; est = ""; acc = ""
    next
}
/^  - Description: / {
    desc = substr($0, index($0, ": ") + 2)
    next
}
/^  - Dependencies: / {
    deps = substr($0, index($0, ": ") + 2)
    next
}
/^  - Assignee: / {
    assignee = substr($0, index($0, ": ") + 2)
    next
}
/^  - Priority: / {
    priority = substr($0, index($0, ": ") + 2)
    next
}
/^  - Estimation: / {
    est = substr($0, index($0, ": ") + 2)
    next
}
/^  - Acceptance Criteria: / {
    acc = substr($0, index($0, ": ") + 2)
    next
}
END { if (task) print_task() }
function print_task() {
    print "TASK_START"
    print "Title: " task
    print "Phase: " phase
    print "Description: " desc
    print "Dependencies: " deps
    print "Assignee: " assignee
    print "Priority: " priority
    print "Estimation: " est
    print "Acceptance Criteria: " acc
    print "TASK_END"
}
' "$MARKDOWN_FILE" | while IFS= read -r line; do
    if [[ $line == "TASK_START" ]]; then
        title=""
        phase=""
        desc=""
        deps=""
        assignee=""
        priority=""
        est=""
        acc=""
    elif [[ $line == "TASK_END" ]]; then
        # Clean labels
        priority_label=$(clean_label "$priority")
        assignee_label=$(clean_label "$assignee")

        # Body
        body="$desc

**Dependencies:** $deps
**Assignee:** $assignee
**Priority:** $priority
**Estimation:** $est
**Acceptance Criteria:** $acc"

        # Create issue
        echo "Creating issue: $title"
        if $DRY_RUN; then
            echo "DRY RUN: gh issue create --repo \"$REPO\" --title \"$title\" --body \"$body\" --label \"$phase_label\" --label \"$priority_label\" --label \"$assignee_label\""
        else
            if gh issue create --repo "$REPO" --title "$title" --body "$body" --label "$phase_label" --label "$priority_label" --label "$assignee_label"; then
                echo "✓ Issue created successfully"
            else
                echo "✗ Failed to create issue: $title"
            fi
        fi
    elif [[ $line == Title:* ]]; then
        title=${line#Title: }
    elif [[ $line == Phase:* ]]; then
        phase=${line#Phase: }
    elif [[ $line == Description:* ]]; then
        desc=${line#Description: }
    elif [[ $line == Dependencies:* ]]; then
        deps=${line#Dependencies: }
    elif [[ $line == Assignee:* ]]; then
        assignee=${line#Assignee: }
    elif [[ $line == Priority:* ]]; then
        priority=${line#Priority: }
    elif [[ $line == Estimation:* ]]; then
        est=${line#Estimation: }
    elif [[ $line == "Acceptance Criteria:"* ]]; then
        acc=${line#Acceptance Criteria: }
    fi
done

echo "All issues created successfully."

# List created issues
echo "Listing created issues:"
gh issue list --repo "$REPO"
// ... keep existing imports ...

import { supabase } from "@/lib/supabase";
import { Task, Role } from "@/lib/types";
// import { Badge } from "lucide-react";
import {Badge} from "@/components/ui/badge";
 // import { Badge } from "@/components/ui/badge"; // ✅ Adjust this path as per your project

// import { format } from "path";
import { format } from "date-fns";

import { useState } from "react";
import { toast } from "sonner";

// Add type definition for RecurrencePattern
interface RecurrencePattern {
  type: string;
  interval?: number;
  frequency?: string;
  endDate?: Date;
}

// Add type definition for TaskStatus
type TaskStatus = 'to-do' | 'in-progress' | 'done';

// Add type definition for TaskFrequency
type TaskFrequency = 'one-time' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

interface TaskCardProps {
  task: Task
  roles?: Role[]
  role?: Role
  onToggleComplete: (taskId: string) => void
  onDelete: (taskId: string) => void
  onUpdate: (task: Task) => void
  onUpdateTimeSpent?: (taskId: string, additionalSeconds: number) => void
  compact?: boolean
  onMoveUp?: (taskId: string) => void
  onMoveDown?: (taskId: string) => void
  isFirst?: boolean
  isLast?: boolean
}

export default function TaskCard({
  task,
  roles = [],
  role,
  onToggleComplete,
  onDelete,
  onUpdate,
  onUpdateTimeSpent,
  compact = false,
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false,
}: TaskCardProps) {
  // ... keep existing state declarations ...

  // Update state types for better type safety
  const [editStatus, setEditStatus] = useState<TaskStatus>(task.status as TaskStatus || 'to-do')
  const [editFrequency, setEditFrequency] = useState<TaskFrequency>(task.frequency as TaskFrequency || 'one-time')
  const [editTitle, setEditTitle] = useState(task.title || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editDescription, setEditDescription] = useState(task.description || "");
  const [editQuadrant, setEditQuadrant] = useState(task.quadrant || "");
  const [editRoleId, setEditRoleId] = useState(task.roleId || "");
  const [editDueDate, setEditDueDate] = useState<Date | null>(task.dueDate ? new Date(task.dueDate) : null);
const [editStartDate, setEditStartDate] = useState<Date | null>(task.startDate ? new Date(task.startDate) : null);
const [editPriority, setEditPriority] = useState(task.priority || "");
const [editLinks, setEditLinks] = useState(task.links || "");
const [editPomodoroRequired, setEditPomodoroRequired] = useState(task.pomodoroRequired || 1);

  // Fix the property naming inconsistency
  const [editIsBigRock, setEditIsBigRock] = useState(task.isBigRock || false)
  const [editIsRitual, setEditIsRitual] = useState(task.isRitual || false)

  // ... keep existing functions ...

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      toast.error("Task title cannot be empty");
      // OR
      toast("Task title cannot be empty", {
        description: "Please enter a title before saving.",
      });
      
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          title: editTitle,
          description: editDescription || null,
          quadrant: editQuadrant,
          role_id: editRoleId || null,
          due_date: editDueDate ? format(editDueDate, "yyyy-MM-dd") : null,
          start_date: editStartDate ? format(editStartDate, "yyyy-MM-dd") : null,
          priority: editPriority || null,
          is_big_rock: editIsBigRock,
          is_ritual: editIsRitual,
          frequency: editFrequency || "one-time",
          status: editStatus || "to-do",
          links: editLinks || null,
          pomodoro_required: editPomodoroRequired,
        })
        .eq("id", task.id)

      if (error) throw error;

      // Update local state with consistent property names
      const updatedTask = {
        ...task,
        title: editTitle,
        description: editDescription,
        quadrant: editQuadrant,
        roleId: editRoleId,
        dueDate: editDueDate ? format(editDueDate, "yyyy-MM-dd") : undefined,
        startDate: editStartDate ? format(editStartDate, "yyyy-MM-dd") : undefined,
        isBigRock: editIsBigRock,
        isRitual: editIsRitual,
        priority: editPriority,
        frequency: editFrequency,
        status: editStatus,
        links: editLinks,
        pomodoroRequired: editPomodoroRequired,
      };

      onUpdate(updatedTask)
      // ... keep rest of the function ...
    }
    catch{
      
    }
  }

  // Fix the role color styling to handle undefined
  const getRoleStyle = (role?: Role) => {
    if (!role?.color) return {};
    return {
      backgroundColor: `${role.color}20`,
      borderColor: role.color
    };
  };

  return (
    <>
      {/* ... keep existing JSX ... */}
      {role && (
        <Badge variant="outline" style={getRoleStyle(role)}>
          {role.name}
        </Badge>
      )}
      {/* ... keep rest of the JSX ... */}
    </>
  );
}
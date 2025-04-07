/**
 * Maps Franklin Covey priorities to Covey Quadrants
 */
export function mapFranklinPriorityToQuadrant(priority: string | null | undefined): string {
  if (!priority) return "q4" // Default to Q4 if no priority

  switch (priority.toUpperCase().charAt(0)) {
    case "A":
      return "q1" // Urgent & Important
    case "B":
      return "q2" // Important, Not Urgent
    case "C":
      return "q3" // Urgent, Not Important
    default:
      return "q4" // Not Urgent, Not Important
  }
}

/**
 * Converts tasks from Franklin Planner format to Covey Quadrant tasks
 */
export function convertFranklinTasksToQuadrantTasks(franklinTasks: any[], userId: string) {
  return franklinTasks
    .filter((task) => task.text && task.text.trim() !== "") // Filter out empty tasks
    .map((task) => ({
      id: task.id,
      title: task.text,
      description: `Franklin Covey task (Priority: ${task.priority || "None"})`,
      quadrant: mapFranklinPriorityToQuadrant(task.priority),
      completed: task.completed || false,
      timeSpent: 0,
      subtasks: [],
      userId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isRitual: false,
      is_big_rock: task.priority === "A", // A-priority tasks are considered "big rocks"
    }))
}


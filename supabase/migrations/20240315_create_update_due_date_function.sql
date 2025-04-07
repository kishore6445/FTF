-- Create a function to update task due date
CREATE OR REPLACE FUNCTION public.update_task_due_date(task_id UUID, due_date_value DATE)
RETURNS void AS $$
BEGIN
  UPDATE public.tasks
  SET due_date = due_date_value
  WHERE id = task_id;
END;
$$ LANGUAGE plpgsql;


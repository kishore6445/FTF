-- Create a generic function to update any field in the tasks table
CREATE OR REPLACE FUNCTION update_task_field(task_id UUID, field_name TEXT, field_value TEXT)
RETURNS VOID AS $$
DECLARE
  query TEXT;
BEGIN
  -- Construct and execute dynamic SQL to update the specified field
  query := format('UPDATE tasks SET %I = $1 WHERE id = $2', field_name);
  EXECUTE query USING field_value, task_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to execute arbitrary SQL (with security restrictions)
CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT, params JSONB)
RETURNS VOID AS $$
DECLARE
  -- Add any variables needed for processing
BEGIN
  -- Security check: Only allow UPDATE statements on the tasks table
  IF NOT (sql_query ILIKE 'UPDATE tasks%') THEN
    RAISE EXCEPTION 'Only UPDATE statements on tasks table are allowed';
  END IF;
  
  -- Execute the SQL with the provided parameters
  EXECUTE sql_query USING params;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


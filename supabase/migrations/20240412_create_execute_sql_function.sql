-- Create a function to execute arbitrary SQL
-- This is for diagnostic purposes only and should be used with caution
CREATE OR REPLACE FUNCTION execute_sql(sql_string TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  BEGIN
    EXECUTE sql_string;
    result := jsonb_build_object('success', true, 'message', 'SQL executed successfully');
  EXCEPTION WHEN OTHERS THEN
    result := jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'detail', SQLSTATE
    );
  END;
  
  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION execute_sql TO authenticated;


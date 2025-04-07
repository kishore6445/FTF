-- Create a function to execute raw SQL for emergency cases
-- This is a fallback for when other methods fail
CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  EXECUTE sql_query;
  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION execute_sql TO authenticated;


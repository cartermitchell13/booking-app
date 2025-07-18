-- Add offering drafts table for saving work-in-progress offerings
CREATE TABLE IF NOT EXISTS offering_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  draft_name TEXT NOT NULL,
  form_data JSONB NOT NULL,
  current_step INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add trigger for updated_at
CREATE TRIGGER update_offering_drafts_updated_at BEFORE UPDATE
    ON offering_drafts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_offering_drafts_tenant_id ON offering_drafts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_offering_drafts_created_at ON offering_drafts(created_at);

-- Enable RLS
ALTER TABLE offering_drafts ENABLE ROW LEVEL SECURITY;

-- RLS policies for offering_drafts
CREATE POLICY "Drafts are viewable by tenant members" ON offering_drafts FOR SELECT 
  USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Drafts are manageable by tenant members" ON offering_drafts FOR ALL 
  USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON offering_drafts TO authenticated; 
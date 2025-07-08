class CreateApiConfigurations < ActiveRecord::Migration[8.0]
  def change
    create_table :api_configurations do |t|
      t.string :credential_path
      t.boolean :is_active
      t.datetime :last_validated_at

      t.timestamps
    end
  end
end

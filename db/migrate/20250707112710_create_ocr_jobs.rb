class CreateOcrJobs < ActiveRecord::Migration[8.0]
  def change
    create_table :ocr_jobs do |t|
      t.string :session_id
      t.string :filename
      t.integer :total_pages
      t.integer :processed_pages
      t.string :status
      t.text :error_message
      t.datetime :completed_at

      t.timestamps
    end
  end
end

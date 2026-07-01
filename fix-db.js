const db = require('./database/db.js');

db.prepare(`
  UPDATE problems SET 
    input_format = REPLACE(input_format, '\\n', char(10)), 
    output_format = REPLACE(output_format, '\\n', char(10)), 
    example_input = REPLACE(example_input, '\\n', char(10)), 
    example_output = REPLACE(example_output, '\\n', char(10))
`).run();

console.log('Database updated successfully.');

using Microsoft.AspNetCore.Mvc;
using Unimicro_to_do_list.Models;
using Unimicro_to_do_list.Services;

namespace Unimicro_to_do_list.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TodoController : ControllerBase
    {

        private readonly ITaskService _taskService;

        public TodoController(ITaskService taskService)
        {
            _taskService = taskService;
        }

        // In order to comply with the REST contract,
        // We dont't want to expose the entities directly,
        // Instead, we return an object with tags as an array of strings
        public class TodoTaskDto
        {
            public string Id { get; set; } = null!;
            public string Title { get; set; } = null!;
            public bool Completed { get; set; }
            public DateTime CreatedAt { get; set; }
            public DateTime? UpdatedAt { get; set; }
            public DateTime? DueDate { get; set; }
            public List<string> Tags { get; set; } = new List<string>();
        }

        // Helper function to map from EF entity to DTO
        private TodoTaskDto ToDto(TodoTask task) =>
            new TodoTaskDto
            {
                Id = task.Id,
                Title = task.Title,
                Completed = task.Completed,
                CreatedAt = task.CreatedAt,
                UpdatedAt = task.UpdatedAt,
                DueDate = task.DueDate,
                // TaskTag objects are flattened into string lists 
                Tags = task.TaskTags.Select(tt => tt.Tag).ToList()
            };

        [HttpGet]
        public async Task<ActionResult<List<TodoTaskDto>>> GetTasks(
            [FromQuery] string? searchTerm = null,
            [FromQuery] bool? completed = null,
            [FromQuery] int skip = 0,
            [FromQuery] int take = 20)
        {
            var (tasks, totalCount) = await _taskService.GetAllTasksAsync(searchTerm, completed, skip, take);
            return Ok(new { tasks = tasks.Select(ToDto), totalCount });
        }

        // GET: api/todo/{id}
        // Lets you query for a certain todo by its id
        [HttpGet("{id}")]
        public async Task<ActionResult<TodoTaskDto>> GetById(string id)
        {
            var todo = await _taskService.GetTaskAsync(id);
            if (todo == null) return NotFound();
            return Ok(ToDto(todo));
        }

        // POST: api/todo
        // Lest you create a new task
        [HttpPost]
        public async Task<ActionResult<TodoTaskDto>> Create([FromBody] TodoInput input)
        {
            // Validation
            if (string.IsNullOrWhiteSpace(input.Title) || input.Title.Length > 140)
            {
                return BadRequest("Title must be 1-140 characters long.");
            }

            var newTodo = new TodoTask
            {
                Title = input.Title,
                Completed = input.Completed ?? false,
                DueDate = input.DueDate,
                TaskTags = input.Tags?.Select(tag => new TaskTag { Tag = tag }).ToList() ?? new List<TaskTag>(),
            };

            var createdTask = await _taskService.CreateTaskAsync(newTodo);
            return CreatedAtAction(nameof(GetById), new { id = createdTask.Id }, ToDto(createdTask));
        }

        // PUT: api/todo/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<TodoTaskDto>> Update(string id, [FromBody] TodoInput input)
        {

            // Validation
            if (string.IsNullOrWhiteSpace(input.Title) || input.Title.Length > 140)
            {
                return BadRequest("Title must be 1-140 characters long.");
            }

            try
            {
                var updatedTask = new TodoTask
                {
                    Id = id, // required so EF knows which task to update
                    Title = input.Title,
                    Completed = input.Completed ?? false,
                    DueDate = input.DueDate,
                    TaskTags = input.Tags?.Select(tag => new TaskTag { Tag = tag }).ToList() ?? new List<TaskTag>()
                };

                var result = await _taskService.UpdateTaskAsync(id, updatedTask);
                return Ok(ToDto(result));
            }
            catch (ArgumentException)
            {
                return NotFound();
            }
        }

        // DELETE: api/todo/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var existing = await _taskService.GetTaskAsync(id);
            if (existing == null) return NotFound();

            await _taskService.DeleteTaskAsync(id);
            return NoContent();
        }
    }
}
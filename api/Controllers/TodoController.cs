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

        // GET: api/todo?query=&completed=true|false
        // [HttpGet]
        // // FromQuery mean the parameters are read from the URL query parameters
        // public IActionResult GetAll([FromQuery] string? query, [FromQuery] bool? completed)
        // {
        //     IEnumerable<TodoTask> result = todos;

        //     // Ensures a query isn't just whitespace
        //     if (!string.IsNullOrWhiteSpace(query))
        //     {
        //         // Allow search to be both lower and upper case by convertin to lower
        //         query = query.ToLower();
        //         // Filters todos, returning those who match either the title or tag
        //         result = result.Where(t =>
        //             t.Title.ToLower().Contains(query) ||
        //             t.Tags.Any(tag => tag.ToLower().Contains(query))
        //         );
        //     }

        //     // If the user has included a completed filter, we only return todos matching that bool
        //     if (completed.HasValue)
        //     {
        //         result = result.Where(t => t.Completed == completed.Value);
        //     }

        //     // Sorts the list so that incomplete todos appear first
        //     var sorted = result.OrderBy(t => t.Completed).ToList();
        //     // Return a HTTP 200 OK
        //     return Ok(sorted);
        // }

        [HttpGet]
        public async Task<ActionResult<List<TodoTask>>> GetTasks(
            [FromQuery] string? searchTerm = null,
            [FromQuery] bool? completed = null,
            [FromQuery] int skip = 0,
            [FromQuery] int take = 20)
        {
            var tasks = await _taskService.GetAllTasksAsync(searchTerm, completed, skip, take);
            return Ok(tasks);
        }

        // GET: api/todo/{id}
        // Lets you query for a certain todo by its id
        [HttpGet("{id}")]
        public async Task<ActionResult<TodoTask>> GetById(string id)
        {
            var todo = await _taskService.GetTaskAsync(id);
            if (todo == null) return NotFound();
            return Ok(todo);
        }

        // POST: api/todo
        // Lest you create a new todo
        [HttpPost]
        public async Task<ActionResult<TodoTask>> Create([FromBody] TodoInput input)
        {
            // Validation
            if (string.IsNullOrWhiteSpace(input.Title) || input.Title.Length > 140)
            {
                return BadRequest("Title must be 1-140 characters long.");
            }

            var newTodo = new TodoTask
            {
                Id = Guid.NewGuid().ToString(),
                Title = input.Title,
                Completed = input.Completed ?? false,
                DueDate = input.DueDate,
                Tags = input.Tags ?? new List<string>(),
                CreatedAt = DateTime.UtcNow,
            };

            var createdTask = await _taskService.CreateTaskAsync(newTodo);
            return CreatedAtAction(nameof(GetById), new { id = createdTask.Id }, createdTask);
        }

        // PUT: api/todo/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<TodoTask>> Update(string id, [FromBody] TodoInput input)
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
                    Tags = input.Tags ?? new List<string>()
                };

                var result = await _taskService.UpdateTaskAsync(id, updatedTask);
                return Ok(result);
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
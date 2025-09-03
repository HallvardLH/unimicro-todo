using Microsoft.AspNetCore.Mvc;
using Unimicro_to_do_list.Models;

namespace Unimicro_to_do_list.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TodoController : ControllerBase
    {
        // In-memory storage for now
        private static List<TodoTask> todos = new List<TodoTask>
        {
            new TodoTask
            {
                Id = Guid.NewGuid().ToString(),
                Title = "Learn .NET",
                Completed = false,
                Tags = new List<string> { "learning", "dotnet" },
                CreatedAt = DateTime.UtcNow
            },
            new TodoTask
            {
                Id = Guid.NewGuid().ToString(),
                Title = "Build a To-do API",
                Completed = false,
                Tags = new List<string> { "project", "api" },
                CreatedAt = DateTime.UtcNow
            }
        };

        // GET: api/todo?query=&completed=true|false
        [HttpGet]
        // FromQuery mean the parameters are read from the URL query parameters
        public IActionResult GetAll([FromQuery] string? query, [FromQuery] bool? completed)
        {
            IEnumerable<TodoTask> result = todos;

            // Ensures a query isn't just whitespace
            if (!string.IsNullOrWhiteSpace(query))
            {
                // Allow search to be both lower and upper case by convertin to lower
                query = query.ToLower();
                // Filters todos, returning those who match either the title or tag
                result = result.Where(t =>
                    t.Title.ToLower().Contains(query) ||
                    t.Tags.Any(tag => tag.ToLower().Contains(query))
                );
            }

            // If the user has included a completed filter, we only return todos matching that bool
            if (completed.HasValue)
            {
                result = result.Where(t => t.Completed == completed.Value);
            }

            // Sorts the list so that incomplete todos appear first
            var sorted = result.OrderBy(t => t.Completed).ToList();
            // Return a HTTP 200 OK
            return Ok(sorted);
        }

        // GET: api/todo/{id}
        // Lets you query for a certain todo by its id
        [HttpGet("{id}")]
        public IActionResult GetById(string id)
        {
            // Returns the first element that matched the id, or null if none match
            var todo = todos.FirstOrDefault(t => t.Id == id);
            if (todo == null) return NotFound();
            return Ok(todo);
        }

        // POST: api/todo
        // Lest you create a new todo
        [HttpPost]
        public IActionResult Create([FromBody] TodoInput input)
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
                UpdatedAt = null
            };

            todos.Add(newTodo);
            return CreatedAtAction(nameof(GetById), new { id = newTodo.Id }, newTodo);
        }

        // PUT: api/todo/{id}
        [HttpPut("{id}")]
        public IActionResult Update(string id, [FromBody] TodoInput input)
        {
            var todo = todos.FirstOrDefault(t => t.Id == id);
            if (todo == null) return NotFound();

            // Validation
            if (string.IsNullOrWhiteSpace(input.Title) || input.Title.Length > 140)
            {
                return BadRequest("Title must be 1-140 characters long.");
            }

            todo.Title = input.Title;
            todo.Completed = input.Completed ?? todo.Completed;
            todo.DueDate = input.DueDate;
            todo.Tags = input.Tags ?? new List<string>();
            todo.UpdatedAt = DateTime.UtcNow;

            return NoContent();
        }

        // DELETE: api/todo/{id}
        [HttpDelete("{id}")]
        public IActionResult Delete(string id)
        {
            var todo = todos.FirstOrDefault(t => t.Id == id);
            if (todo == null) return NotFound();

            todos.Remove(todo);
            return NoContent();
        }
    }
}
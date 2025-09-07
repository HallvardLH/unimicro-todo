using Microsoft.AspNetCore.Mvc;
using Unimicro_to_do_list.Models;
using Unimicro_to_do_list.Services;

namespace Unimicro_to_do_list.Controllers
{
    /// <summary>
    /// Controller for managing Todo tasks.
    /// Provides endpoints to create, read, update, and delete tasks.
    /// Returns DTOs to comply with REST principles (avoids exposing EF entities directly).
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class TodoController : ControllerBase
    {

        private readonly ITaskService _taskService;
        private readonly ILogger<TodoController> _logger;

        /// <summary>
        /// Initializes a new instance of <see cref="TodoController"/>.
        /// </summary>
        /// <param name="taskService">Service for interacting with tasks.</param>
        /// <param name="logger">Logger instance.</param>
        public TodoController(ITaskService taskService, ILogger<TodoController> logger)
        {
            _taskService = taskService;
            _logger = logger;
        }

        /// <summary>
        /// Data Transfer Object for Todo tasks.
        /// In order to comply with the REST contract,
        /// We dont't want to expose the entities directly,
        /// Instead, we return an object with tags as an array of strings
        /// </summary>
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

        /// <summary>
        /// Maps EF TodoTask entity to TodoTaskDto.
        /// </summary>
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

        /// <summary>
        /// Gets a paginated list of Todo tasks.
        /// Supports optional filtering by search term, completion, overdue status, and sorting.
        /// </summary>
        /// <param name="searchTerm">Filter by task title containing this term.</param>
        /// <param name="completed">Filter completed (true) or incomplete (false) tasks.</param>
        /// <param name="overdue">Filter overdue tasks.</param>
        /// <param name="skip">Number of tasks to skip (pagination).</param>
        /// <param name="take">Number of tasks to return (pagination).</param>
        /// <param name="orderBy">Field to order by ("CreatedAt", "DueDate", "Title").</param>
        /// <param name="ascending">Whether to sort ascending.</param>
        /// <returns>List of TodoTaskDto objects with counts.</returns>
        [HttpGet]
        public async Task<ActionResult<List<TodoTaskDto>>> GetTasks(
            [FromQuery] string? searchTerm = null,
            [FromQuery] bool? completed = null,
            [FromQuery] bool? overdue = null,
            [FromQuery] int skip = 0,
            [FromQuery] int take = 20,
            [FromQuery] string? orderBy = "CreatedAt",
            [FromQuery] bool ascending = false)
        {
            _logger.LogInformation(
                "Fetching tasks. SearchTerm={SearchTerm}, Completed={Completed}, Overdue={Overdue}, Skip={Skip}, Take={Take}, OrderBy={OrderBy}, Ascending={Ascending}",
                searchTerm, completed, overdue, skip, take, orderBy, ascending);

            try
            {
                // We call the service to fetch tasks as well as related counts
                var (tasks, totalCount, completedCount) = await _taskService.GetAllTasksAsync(
                    searchTerm, completed, overdue, skip, take, orderBy, ascending);

                _logger.LogInformation("Fetched {Count} tasks", tasks.Count);

                // We return the tasks as DTOs, along with count
                return Ok(new
                {
                    tasks = tasks.Select(ToDto),
                    totalCount,
                    completedCount,
                    returnedCount = tasks.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching tasks");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Gets a single task by its ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<TodoTaskDto>> GetById(string id)
        {
            var todo = await _taskService.GetTaskAsync(id);
            if (todo == null) return NotFound();
            return Ok(ToDto(todo));
        }

        /// <summary>
        /// Creates a new task.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<TodoTaskDto>> Create([FromBody] TodoInput input)
        {
            _logger.LogInformation("Creating new task with name: {Title}", input.Title);
            // Validation
            if (string.IsNullOrWhiteSpace(input.Title) || input.Title.Length > 140)
            {
                _logger.LogWarning("Invalid task title: {Title}", input.Title);
                return BadRequest("Title must be 1-140 characters long.");
            }

            try
            {
                // We crreate an EF entity from input
                var newTodo = new TodoTask
                {
                    Title = input.Title,
                    Completed = input.Completed ?? false,
                    DueDate = input.DueDate,
                    TaskTags = input.Tags?.Select(tag => new TaskTag { Tag = tag }).ToList() ?? new List<TaskTag>(),
                };

                // Persist task using service
                var createdTask = await _taskService.CreateTaskAsync(newTodo);

                _logger.LogInformation("Task created with ID: {Id}", createdTask.Id);

                // Returns the created task DTO with a 201 status
                return CreatedAtAction(nameof(GetById), new { id = createdTask.Id }, ToDto(createdTask));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating task with title: {Title}", input.Title);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Updates an existing task by ID.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<TodoTaskDto>> Update(string id, [FromBody] TodoInput input)
        {
            _logger.LogInformation("Updating task {id} with title: {Title}", id, input.Title);

            // Validation
            if (string.IsNullOrWhiteSpace(input.Title) || input.Title.Length > 140)
            {
                _logger.LogWarning("Invalid task title for update: {Title}", input.Title);
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
                _logger.LogInformation("Task {Id} updated successfully", id);
                return Ok(ToDto(result));
            }
            catch (ArgumentException)
            {
                // Return 404 if the task does nto exist
                _logger.LogWarning("Task {Id} not found for update", id);
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating task {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Deletes a task by ID.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            _logger.LogInformation("Deleting task {Id}", id);

            // Check if task exists
            var existing = await _taskService.GetTaskAsync(id);
            if (existing == null)
            {
                _logger.LogWarning("Task {Id} not found for deletion", id);
                return NotFound();
            }

            try
            {
                await _taskService.DeleteTaskAsync(id);
                _logger.LogInformation("Task {Id} deleted successfully", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting task {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
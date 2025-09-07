using Microsoft.EntityFrameworkCore;
using Unimicro_to_do_list.Data;
using Unimicro_to_do_list.Models;

namespace Unimicro_to_do_list.Services
{
    public interface ITaskService
    {
        Task<(List<TodoTask> Tasks, int TotalCount, int CompletedCount)> GetAllTasksAsync(string? searchTerm = null, bool? completed = null, bool? overdue = null, int skip = 0, int take = 20, string? orderBy = "CreatedAt", bool ascending = false);
        Task<TodoTask?> GetTaskAsync(string id);
        Task<TodoTask> CreateTaskAsync(TodoTask task);
        Task<TodoTask> UpdateTaskAsync(string id, TodoTask task);
        Task DeleteTaskAsync(string id);
    }

    public class TaskService : ITaskService
    {
        private readonly ApplicationDbContext _context;

        // Get the database context
        public TaskService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<(List<TodoTask> Tasks, int TotalCount, int CompletedCount)> GetAllTasksAsync(
            string? searchTerm = null,
            bool? completed = null,
            bool? overdue = null,
            int skip = 0,
            int take = 20,
            string? orderBy = "CreatedAt",
            bool ascending = false)
        {
            var query = _context.Tasks.Include(t => t.TaskTags).AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(t => t.Title.Contains(searchTerm) || t.TaskTags.Any(tt => tt.Tag.Contains(searchTerm)));
            }

            var totalCount = await query.CountAsync();

            var completedCount = await query.CountAsync(t => t.Completed);

            if (completed.HasValue)
            {
                query = query.Where(t => t.Completed == completed.Value);
            }

            if (overdue.HasValue)
            {
                var now = DateTime.UtcNow;
                query = query.Where(t => !t.Completed && t.DueDate < now);
            }

            // Ordering
            query = orderBy?.ToLower() switch
            {
                "title" => ascending ? query.OrderBy(t => t.Title) : query.OrderByDescending(t => t.Title),
                "duedate" => ascending ? query.OrderBy(t => t.DueDate) : query.OrderByDescending(t => t.DueDate),
                "updatedat" => ascending ? query.OrderBy(t => t.UpdatedAt) : query.OrderByDescending(t => t.UpdatedAt),
                _ => ascending ? query.OrderBy(t => t.CreatedAt) : query.OrderByDescending(t => t.CreatedAt),
            };

            var tasks = await query.Skip(skip)
                                   .Take(take)
                                   .ToListAsync();

            return (tasks, totalCount, completedCount);
        }


        // Retrieve a single task by ID
        public async Task<TodoTask?> GetTaskAsync(string id)
        {
            return await _context.Tasks
                .Include(t => t.TaskTags)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        // Create a new task
        public async Task<TodoTask> CreateTaskAsync(TodoTask task)
        {
            task.Id = Guid.NewGuid().ToString(); // Creates a unique id
            task.CreatedAt = DateTime.UtcNow; // Sets a timestamp 
            task.Completed = task.Completed;

            // Add tags
            if (task.TaskTags != null && task.TaskTags.Any())
            {
                // Remove duplicate tags before saving
                // This ensures the same tag being added more than once to a task
                // doesn't cause an error
                task.TaskTags = task.TaskTags
                    .GroupBy(t => t.Tag) // Group by tag text
                    .Select(g => g.First()) // Take first from each group
                    .ToList();

                foreach (var tag in task.TaskTags)
                {
                    tag.TaskId = task.Id; // Set foreign key
                }
            }

            _context.Tasks.Add(task);

            //Save changes to db
            await _context.SaveChangesAsync();

            await _context.Entry(task).Collection(t => t.TaskTags).LoadAsync();
            return task;
        }

        // Update an existing task
        public async Task<TodoTask> UpdateTaskAsync(string id, TodoTask taskUpdate)
        {
            // Finds the task in the database
            var existingTask = await _context.Tasks
            .Include(t => t.TaskTags)
            .FirstOrDefaultAsync(t => t.Id == id);

            if (existingTask == null)
                throw new ArgumentException("Task not found");


            existingTask.Title = taskUpdate.Title;
            existingTask.Completed = taskUpdate.Completed;
            existingTask.DueDate = taskUpdate.DueDate;
            existingTask.UpdatedAt = DateTime.UtcNow;

            // Remove old tags
            // Tags used to be a part of the Task table
            _context.TaskTags.RemoveRange(existingTask.TaskTags);

            if (taskUpdate.TaskTags != null && taskUpdate.TaskTags.Any())
            {
                foreach (var tag in taskUpdate.TaskTags)
                {
                    tag.TaskId = existingTask.Id;
                    _context.TaskTags.Add(tag);
                }
            }

            await _context.SaveChangesAsync();
            return existingTask;
        }

        // Deletes a task by ID
        public async Task DeleteTaskAsync(string id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task != null)
            {
                _context.Tasks.Remove(task);
                await _context.SaveChangesAsync();
            }
        }
    }
}
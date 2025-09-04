using Microsoft.EntityFrameworkCore;
using Unimicro_to_do_list.Data;
using Unimicro_to_do_list.Models;

namespace Unimicro_to_do_list.Services
{
    public interface ITaskService
    {
        Task<List<TodoTask>> GetAllTasksAsync(string? searchTerm = null, bool? completed = null, int skip = 0, int take = 20);
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

        public async Task<List<TodoTask>> GetAllTasksAsync(string? searchTerm = null, bool? completed = null, int skip = 0, int take = 20)
        {
            // We get all the tasks in the database
            var query = _context.Tasks.AsQueryable();

            // Filter by search term, checking both title and tags
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(t => t.Title.Contains(searchTerm) || t.Tags.Any(tag => tag.Contains(searchTerm)));
            }

            // If filter by completion is provided, we filter by that
            if (completed.HasValue)
            {
                query = query.Where(t => t.Completed == completed.Value);
            }

            // Apply ordering (newest first) and pagination
            return await query.OrderByDescending(t => t.CreatedAt)
                             .Skip(skip)
                             .Take(take)
                             .ToListAsync();
        }

        // Retrieve a single task by ID
        public async Task<TodoTask?> GetTaskAsync(string id)
        {
            return await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id);
        }

        // Create a new task
        public async Task<TodoTask> CreateTaskAsync(TodoTask task)
        {
            task.Id = Guid.NewGuid().ToString(); // Creates a unique id
            task.CreatedAt = DateTime.UtcNow; // Sets a timestamp 
            task.Completed = false; //Initializes task as not completed

            _context.Tasks.Add(task); // Adds the new task to the db context
            await _context.SaveChangesAsync(); //Save changes to db
            return task;
        }

        // Update an existing task
        public async Task<TodoTask> UpdateTaskAsync(string id, TodoTask taskUpdate)
        {
            // Finds the task in the database
            var existingTask = await _context.Tasks.FindAsync(id);
            if (existingTask == null)
                throw new ArgumentException("Task not found");

            existingTask.Title = taskUpdate.Title;
            existingTask.Completed = taskUpdate.Completed;
            existingTask.DueDate = taskUpdate.DueDate;
            existingTask.Tags = taskUpdate.Tags;
            existingTask.UpdatedAt = DateTime.UtcNow;

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
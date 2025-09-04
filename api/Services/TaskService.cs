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

        public TaskService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<TodoTask>> GetAllTasksAsync(string? searchTerm = null, bool? completed = null, int skip = 0, int take = 20)
        {
            var query = _context.Tasks.AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(t => t.Title.Contains(searchTerm) ||
                                       t.Tags.Any(tag => tag.Contains(searchTerm)));
            }

            if (completed.HasValue)
            {
                query = query.Where(t => t.Completed == completed.Value);
            }

            return await query.OrderByDescending(t => t.CreatedAt)
                .Skip(skip)
                .Take(take)
                .ToListAsync();
        }

        public async Task<TodoTask?> GetTaskAsync(string id)
        {
            return await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<TodoTask> CreateTaskAsync(TodoTask task)
        {
            task.Id = Guid.NewGuid().ToString();
            task.CreatedAt = DateTime.UtcNow;
            task.Completed = false;

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();
            return task;
        }

        public async Task<TodoTask> UpdateTaskAsync(string id, TodoTask taskUpdate)
        {
            var existingTask = await _context.Tasks.FindAsync(id);
            if (existingTask == null)
                throw new ArgumentException("Task not found");

            existingTask.Title = taskUpdate.Title ?? existingTask.Title;
            existingTask.Completed = taskUpdate.Completed;
            existingTask.DueDate = taskUpdate.DueDate ?? existingTask.DueDate;
            existingTask.Tags = taskUpdate.Tags?.Any() == true ? taskUpdate.Tags : existingTask.Tags;
            existingTask.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return existingTask;
        }

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
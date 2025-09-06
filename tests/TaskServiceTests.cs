using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
// Assertions like .Should().Be()
using FluentAssertions;
// Need in-memory db  for testing
using Microsoft.EntityFrameworkCore;
using Unimicro_to_do_list.Data;
using Unimicro_to_do_list.Models;
using Unimicro_to_do_list.Services;
using Xunit;

namespace tests
{
    public class TaskServiceTests
    {
        // Each call of this will create a fresh in-memory db for testing
        private ApplicationDbContext GetInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString()) // unique DB per test
                .Options;
            return new ApplicationDbContext(options);
        }

        // Tests CreateTaskAsync to ensure it sets default fields correctly
        [Fact]
        public async Task CreateTaskAsync_ShouldSetDefaults()
        {
            // Creating a fresh context and TaskService
            var context = GetInMemoryDbContext();
            var service = new TaskService(context);

            var newTask = new TodoTask
            {
                Title = "Write README",
                Completed = false
            };

            // Call the method to persist the task
            var task = await service.CreateTaskAsync(newTask);

            // Checks if the fields have the correct default values
            task.Title.Should().Be("Write README");
            task.Completed.Should().BeFalse();
            task.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(2));
            task.Id.Should().NotBeNullOrEmpty();
        }

        // Tests GetTaskAsync, ensuring that it returns tasks if they exist
        [Fact]
        public async Task GetTaskAsync_ShouldReturnTask_WhenExists()
        {
            var context = GetInMemoryDbContext();
            var service = new TaskService(context);

            // Create task
            var taskToCreate = new TodoTask { Title = "Existing Task" };
            var createdTask = await service.CreateTaskAsync(taskToCreate);

            // Retrieve the task using its ID
            var task = await service.GetTaskAsync(createdTask.Id);

            // Now, the task should exist
            task.Should().NotBeNull();
            // And the title should be the same
            task!.Title.Should().Be("Existing Task");
        }

        [Fact]
        public async Task GetTaskAsync_ShouldReturnNull_WhenNotFound()
        {
            var context = GetInMemoryDbContext();
            var service = new TaskService(context);

            var task = await service.GetTaskAsync("non-existent-id");

            task.Should().BeNull();
        }

        [Fact]
        public async Task CreateTaskAsync_ShouldHandleTags()
        {
            var context = GetInMemoryDbContext();
            var service = new TaskService(context);

            var newTask = new TodoTask
            {
                Title = "Task with tags",
                TaskTags = new List<TaskTag>
                {
                    new TaskTag { Tag = "urgent" },
                    new TaskTag { Tag = "work" },
                    new TaskTag { Tag = "urgent" } // duplicate, should be removed
                }
            };

            var task = await service.CreateTaskAsync(newTask);

            task.TaskTags.Should().HaveCount(2); // duplicates removed
            task.TaskTags.Select(t => t.Tag).Should().Contain(new[] { "urgent", "work" });
            task.TaskTags.All(t => t.TaskId == task.Id).Should().BeTrue();
        }
    }
}

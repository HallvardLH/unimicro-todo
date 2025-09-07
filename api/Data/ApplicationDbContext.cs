using Microsoft.EntityFrameworkCore;
using Unimicro_to_do_list.Models;

namespace Unimicro_to_do_list.Data
{
    /// <summary>
    /// The main Entity Framework Core DbContext for the application.
    /// Manages access to TodoTask and TaskTag tables in the database.
    /// </summary>
    public class ApplicationDbContext : DbContext
    {
        /// <summary>
        /// Initializes a new instance of <see cref="ApplicationDbContext"/> with the specified options.
        /// </summary>
        /// <param name="options">Configuration options for the DbContext.</param>
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        /// <summary>
        /// Represents the TodoTask table.
        /// </summary>
        public DbSet<TodoTask> Tasks { get; set; }

        /// <summary>
        /// Represents the TaskTag table.
        /// </summary>
        public DbSet<TaskTag> TaskTags { get; set; }

        /// <summary>
        /// Configures the EF Core model with constraints, relationships, and default values.
        /// </summary>
        /// <param name="modelBuilder">The ModelBuilder to configure entities.</param>
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure TodoTask entity
            modelBuilder.Entity<TodoTask>(entity =>
            {
                entity.HasKey(e => e.Id); // Primary key
                entity.Property(e => e.Title)
                      .HasMaxLength(140)
                      .IsRequired(); // Title is required and max length 140
                entity.Property(e => e.CreatedAt)
                      .HasDefaultValueSql("GETUTCDATE()"); // Default timestamp

                // One-to-many relationship with TaskTag
                entity.HasMany(t => t.TaskTags)
                      .WithOne(tt => tt.Task)
                      .HasForeignKey(tt => tt.TaskId)
                      .OnDelete(DeleteBehavior.Cascade); // Delete tags when task is deleted
            });

            // Configure TaskTag entity
            modelBuilder.Entity<TaskTag>(entity =>
            {
                entity.HasKey(tt => new { tt.Tag, tt.TaskId }); // Composite primary key

                entity.Property(e => e.Tag).IsRequired(); // Tag string is required
                entity.Property(e => e.TaskId).IsRequired(); // Must reference a Task
            });
        }
    }
}

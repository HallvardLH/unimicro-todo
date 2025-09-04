using Microsoft.EntityFrameworkCore;
using Unimicro_to_do_list.Models;

namespace Unimicro_to_do_list.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<TodoTask> Tasks { get; set; }
        public DbSet<TaskTag> TaskTags { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<TodoTask>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).HasMaxLength(140).IsRequired();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

                entity.HasMany(t => t.TaskTags)
                      .WithOne(tt => tt.Task)
                      .HasForeignKey(tt => tt.TaskId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<TaskTag>(entity =>
            {
                entity.HasKey(tt => new { tt.Tag, tt.TaskId });

                entity.Property(e => e.Tag).IsRequired();
                entity.Property(e => e.TaskId).IsRequired();
            });
        }
    }
}
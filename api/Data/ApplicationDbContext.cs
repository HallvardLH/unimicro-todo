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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<TodoTask>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).HasMaxLength(140).IsRequired();
                entity.Property(e => e.Tags).HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
                );
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            });
        }
    }
}
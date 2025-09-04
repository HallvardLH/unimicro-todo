using System;

namespace Unimicro_to_do_list.Models
{
    public class TodoTask
    {
        public string Id { get; set; } = null!;
        public string Title { get; set; } = string.Empty;
        public bool Completed { get; set; } = false;
        public DateTime? DueDate { get; set; }
        // public List<string> Tags { get; set; } = new List<string>();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; } = null;

        public ICollection<TaskTag> TaskTags { get; set; } = new List<TaskTag>();
    }
}

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Unimicro_to_do_list.Models
{
    public class TaskTag
    {

        public string Tag { get; set; } = null!;
        public string TaskId { get; set; } = null!;

        [ForeignKey("TaskId")]
        public TodoTask Task { get; set; } = null!;
    }
}

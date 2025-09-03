using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Unimicro_to_do_list.Models
{
    public class TodoInput
    {
        [Required]
        [StringLength(140, MinimumLength = 1)]
        public string Title { get; set; } = string.Empty;

        public bool? Completed { get; set; }
        public DateTime? DueDate { get; set; }
        public List<string>? Tags { get; set; }
    }
}

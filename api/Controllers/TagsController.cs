using Microsoft.AspNetCore.Mvc;
using Unimicro_to_do_list.Models;

namespace Unimicro_to_do_list.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class TagsController : ControllerBase
    {
        private static List<string> tags = new List<string>
    {
        "learning", "dotnet", "project", "api"
    };

        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(tags);
        }

        [HttpPost]
        public IActionResult Create([FromBody] string tag)
        {
            if (string.IsNullOrWhiteSpace(tag)) return BadRequest("Tag cannot be empty.");
            if (tags.Contains(tag.ToLower())) return Conflict("Tag already exists.");

            tags.Add(tag.ToLower());
            return CreatedAtAction(nameof(GetAll), tag);
        }
    }
}

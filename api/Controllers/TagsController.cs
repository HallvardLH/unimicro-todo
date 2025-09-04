using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Unimicro_to_do_list.Data;

namespace Unimicro_to_do_list.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TagsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TagsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/tags
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tags = await _context.Tasks
                .SelectMany(t => t.Tags)
                .Distinct()
                .OrderBy(t => t)
                .ToListAsync();

            return Ok(tags);
        }
    }
}

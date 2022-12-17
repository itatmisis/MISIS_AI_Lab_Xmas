using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using XmasHack.API.Configuration;
using XmasHack.API.CRUD_API;
using XmasHack.API.CRUD_API.Models.Requests;
using XmasHack.API.Models;
using XmasHack.API.RabbitMQ;
using XmasHack.API.RabbitMQ.Contracts;

namespace XmasHack.API.Controllers
{

    [ApiController]
    [Route("[controller]")]
    public class UploadDocsController: Controller
    {
        private readonly AppSettings _appSettings;
        private readonly ICrudAPI _crudAPI;
        private readonly RabbitMQDocsPublisher _rabbitMQDocsPublisher;

        public UploadDocsController(IOptions<AppSettings> appSettings, IOptions<RabbitMQConfig> rabbitMQConfig, ICrudAPI crudAPI)
        {
            _appSettings = appSettings.Value;
            _crudAPI = crudAPI;
            _rabbitMQDocsPublisher = new RabbitMQDocsPublisher(rabbitMQConfig.Value);
        }


        [HttpPost]
        public async Task<IActionResult> UploadDocs([FromForm] List<IFormFile> files)
        {
           foreach(var file in files)
            {
                try
                {
                    string fileName = $"{Guid.NewGuid()}-{file.FileName}";
                    await SaveDocsToFolder(file, fileName);
                    int docsId = await _crudAPI.SaveDocs(new SaveDocsRequest()
                    {
                        FileName = file.FileName,
                        FilePath = fileName
                    });

                    _rabbitMQDocsPublisher.Send(new DocsMessage()
                    {
                        Path = fileName,
                        TaskId = docsId
                    });
                }
                catch(Exception ex)
                {
					Console.WriteLine(ex.Message);
                    return BadRequest($"Ошибка во время сохрвнения файла: {file.FileName}. {ex.Message}");
                }
               
            }
            return Ok("Документы успешно сохранены");

        }

        [HttpGet]
        [Route("GetAllFiles")]
        public async Task<IActionResult> GetAllFiles()
        {
			try
			{
                var docs = await _crudAPI.GetAllDocs();
                return Ok(docs.Documents);
			}
            catch(Exception ex)
			{
				Console.WriteLine(ex.Message);
                return BadRequest("Ошибка во время получения файлов");
			}
        }

        [HttpGet]
        [Route("GetJsonByName")]
        public IActionResult GetJsonByName(string name)
		{
			try
			{
                string file = System.IO.File.ReadAllText($"/predict_info/{name}.json");
                return Ok(file);
            }
            catch(Exception ex)
			{
                return BadRequest("Ошибка во время получения файла");
			}

   
        }

        private  async Task SaveDocsToFolder(IFormFile file, string docsName)
        {
            string filePath = Path.Combine(_appSettings.DocumentPath, docsName);
            Console.WriteLine(filePath);
            using (Stream fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }
        }
    }
}

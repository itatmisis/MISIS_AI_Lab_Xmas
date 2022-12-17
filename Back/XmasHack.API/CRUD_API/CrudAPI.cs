using System.Text;
using Newtonsoft.Json;
using XmasHack.API.CRUD_API.Models.Requests;
using XmasHack.API.CRUD_API.Models.Responses;

namespace XmasHack.API.CRUD_API
{
    public class CrudAPI : ICrudAPI
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public CrudAPI(IHttpClientFactory httpClientFactory)
		{
            _httpClientFactory = httpClientFactory;
		}
        public async Task<int> SaveDocs(SaveDocsRequest request)
        {
			using(var httpClient = _httpClientFactory.CreateClient("CrudAPI"))
			{
               // var content = new StringContent(JsonConvert.SerializeObject(request), Encoding.UTF8, "application/json");

                using(var response = await httpClient.PostAsync($"/save_doc?name={request.FileName}&path={request.FilePath}", null))
                {
                   if(!response.IsSuccessStatusCode)
                    {
                        throw new Exception("Ошибка при запросе в Crud API");
					}
                    var createDocsResponse = JsonConvert.DeserializeObject<CreateDocsResponse>(await response.Content.ReadAsStringAsync());

                    if(createDocsResponse == null)
                    {
                        throw new Exception("Ошибка во время десереализации ответа");
                    }

                    return createDocsResponse.Id;
                }
            }
        }

        public async Task<GetAllDocumentsResponse> GetAllDocs()
		{
            using(var httpClient = _httpClientFactory.CreateClient("CrudAPI"))
            {
                using(var response = await httpClient.GetAsync("/get_all_docs", HttpCompletionOption.ResponseHeadersRead))
                {
                    if(!response.IsSuccessStatusCode)
                    {
                        throw new Exception("Ошибка при запросе в Crud API");
                    }
                    var docses = JsonConvert.DeserializeObject<GetAllDocumentsResponse>(await response.Content.ReadAsStringAsync());

                    if(docses == null)
					{
                        throw new Exception("Ошибка во время получения списка документов");
					}

                    return docses;
                }
            }
        }
    }
}

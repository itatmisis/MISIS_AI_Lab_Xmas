using XmasHack.API.CRUD_API.Models.Requests;
using XmasHack.API.CRUD_API.Models.Responses;

namespace XmasHack.API.CRUD_API
{
    public interface ICrudAPI
    {
        public Task<int> SaveDocs(SaveDocsRequest request);
        public Task<GetAllDocumentsResponse> GetAllDocs();
    }
}

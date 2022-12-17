using Newtonsoft.Json;

namespace XmasHack.API.RabbitMQ.Contracts
{
	public class DocsMessage
	{
		[JsonProperty("doc_path")]
		public string Path { get; set; }

		[JsonProperty("task_id")]
		public int TaskId { get; set; }
	}
}

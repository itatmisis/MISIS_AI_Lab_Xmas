using Microsoft.AspNetCore.Http.Features;
using XmasHack.API.Configuration;
using XmasHack.API.CRUD_API;

namespace XmasHack.API
{
    public class Startup
    {
        private readonly IConfiguration _configuration;
        public Startup(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();
            services.AddSwaggerGen();

            services.Configure<FormOptions>(x =>
            {
                x.ValueLengthLimit = int.MaxValue;
                x.MultipartBodyLengthLimit = int.MaxValue;
            });

            var appSettings = _configuration.GetSection("AppSettings");
            services.Configure<AppSettings>(appSettings);

            var rabbitMQConfing = _configuration.GetSection("RabbitMQConfig");
            services.Configure<RabbitMQConfig>(rabbitMQConfing);

            services.AddTransient<ICrudAPI, CrudAPI>();

            services.AddHttpClient("CrudAPI", config =>
            {
                config.BaseAddress = new Uri(appSettings["CrudAPI"]);
                config.Timeout = new TimeSpan(0, 0, 30);
                config.DefaultRequestHeaders.Clear();
            });


            services.AddCors(options =>
            {
                options.AddPolicy("CorsPolicy",
                    builder =>
                    {
                        builder
                            .AllowAnyOrigin()
                            .AllowAnyMethod()
                            .AllowAnyHeader();
                    });
            });

        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseCors("CorsPolicy");

            app.UseHttpsRedirection();

            app.UseRouting();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapGet("/", async context => { await context.Response.WriteAsync("Hello World!"); });
            });
        }
    }
}
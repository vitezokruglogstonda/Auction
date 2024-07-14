using Auction.Server.Services.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace Auction.Server.Services.Implementation
{
    public class PictureService : IPictureService
    {
        private readonly IConfiguration Configuration;
        public IWebHostEnvironment Environment { get; set; }

        public PictureService(IConfiguration _configuration, IWebHostEnvironment environment)
        {
            Configuration = _configuration;
            Environment = environment;
        }

        public string AddImage(string picturePathFragment, IFormFile picture)
        {
            string folderPath = Path.Combine(Environment.WebRootPath, picturePathFragment);
            string fileName = Guid.NewGuid().ToString() + "_" + picture.FileName;
            string filePath = Path.Combine(folderPath, fileName);
            using (FileStream fs = new FileStream(filePath, FileMode.Create))
            {
                picture.CopyTo(fs);
            }
            return fileName;
        }

        public string AddProfilePicture(IFormFile? picture)
        {
            if (picture == null)
                return Configuration.GetSection("EnvironmentVariables").GetSection("DefaultProfilePicturePath").Value!;

            string profilePictureFolder = Configuration.GetSection("EnvironmentVariables").GetSection("ProfilePicturePath").Value!;
            return AddImage(profilePictureFolder, picture);
        }

        public string AddArticlePicture(IFormFile? picture)
        {
            if (picture == null)
                return Configuration.GetSection("EnvironmentVariables").GetSection("DefaultProfilePicturePath").Value!;

            string articlePictureFolder = Configuration.GetSection("EnvironmentVariables").GetSection("ArticlePicturePath").Value!;
            return AddImage(articlePictureFolder, picture);
        }

        public string MakeProfilePictureUrl(string path)
        {
            string serverUrl = Configuration.GetSection("EnvironmentVariables").GetSection("ServerOwnUrl").Value!;
            string profilePictureFolder = Configuration.GetSection("EnvironmentVariables").GetSection("ProfilePicturePath").Value!;
            return Path.Combine(Path.Combine(serverUrl, profilePictureFolder), path);
        }

        public string MakeArticlePictureUrl(string path)
        {
            string serverUrl = Configuration.GetSection("EnvironmentVariables").GetSection("ServerOwnUrl").Value!;
            string profilePictureFolder = Configuration.GetSection("EnvironmentVariables").GetSection("ArticlePicturePath").Value!;
            return Path.Combine(Path.Combine(serverUrl, profilePictureFolder), path);
        }

        public bool DeleteProfilePicture(string photoName) {
            if(photoName == "account_icon.png") return false;
            string profilePictureFolder = Configuration.GetSection("EnvironmentVariables").GetSection("ProfilePicturePath").Value!;
            return this.DeleteImage(photoName, profilePictureFolder);
        }
        public bool DeleteArticlePicture(string photoName){
            string articlePictureFolder = Configuration.GetSection("EnvironmentVariables").GetSection("ArticlePicturePath").Value!;
            return this.DeleteImage(photoName, articlePictureFolder);        
        }

        public bool DeleteImage(string photoName, string pictureFolder)
        {
            string folderPath = Path.Combine(Environment.WebRootPath, pictureFolder);
            var filePath = Path.Combine(folderPath, photoName);

            if (!System.IO.File.Exists(filePath))
                return false;
            System.IO.File.Delete(filePath);
            return true;
        }

    }
}

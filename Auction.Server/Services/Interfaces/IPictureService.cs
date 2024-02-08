namespace Auction.Server.Services.Interfaces
{
    public interface IPictureService
    {
        public string AddImage(string picturePathFragment, IFormFile picture);
        public string AddProfilePicture(IFormFile? picture);
        public string AddArticlePicture(IFormFile? picture);
        public string MakeProfilePictureUrl(string path);
        public string MakeArticlePictureUrl(string path);
        public bool DeletePhoto(string photoName);
    }
}

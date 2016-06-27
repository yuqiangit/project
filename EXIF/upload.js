/**
 * Created by shihuipeng on 16/6/27.
 */
function loadImageFile() {
    //console.log('logImage');
    if (document.getElementById("uploadImage").files.length === 0) {
        return;
    }
    var oFile = document.getElementById("uploadImage").files[0];
    rFilter = /^(?:image\/bmp|image\/cis\-cod|image\/gif|image\/ief|image\/jpeg|image\/jpeg|image\/jpeg|image\/pipeg|image\/png|image\/svg\+xml|image\/tiff|image\/x\-cmu\-raster|image\/x\-cmx|image\/x\-icon|image\/x\-portable\-anymap|image\/x\-portable\-bitmap|image\/x\-portable\-graymap|image\/x\-portable\-pixmap|image\/x\-rgb|image\/x\-xbitmap|image\/x\-xpixmap|image\/x\-xwindowdump)$/i;
    if (!rFilter.test(oFile.type)) {
        alert("You must select a valid image file!");
        return;
    }

    var orientation;

    EXIF.getData(oFile, function () {
        orientation = EXIF.getTag(this, 'Orientation');
    });

    oFReader = new FileReader();

    oFReader.onload = function (oFREvent) {

        $('.save').attr({"disabled":"disabled"}).addClass('disable');
        //document.getElementById("uploadPreview").src = oFREvent.target.result;
        //生成预览图
        getImgData(oFREvent.target.result, orientation, function (datas) {
            var image = datas.split(';');
            var data = {img: image[1].substr(7)};
            $.post('url', data, function (result) {
                    if (result.errCode == 0) {
                        $('.save').attr({"disabled":"disabled"}).addClass('disable');
                        $('.save').removeAttr("disabled").removeClass('disable');
                    }
                }
                , 'json');

            document.getElementById("uploadPreview").src = datas;
        });
    };

    oFReader.onloadend = function () {
//            console.log(oFReader);

    };

    oFReader.readAsDataURL(oFile);
}


// @param {string} img 图片的base64
// @param {int} dir exif获取的方向信息
// @param {function} next 回调方法，返回校正方向后的base64
function getImgData(img, dir, next) {
    var image = new Image();
    image.onload = function () {
        var degree = 0, drawWidth, drawHeight, width, height;
        drawWidth = this.naturalWidth;
        drawHeight = this.naturalHeight;
        //以下改变一下图片大小
        var maxSide = Math.max(drawWidth, drawHeight);
        if (maxSide > 1024) {
            var minSide = Math.min(drawWidth, drawHeight);
            minSide = minSide / maxSide * 1024;
            maxSide = 1024;
            if (drawWidth > drawHeight) {
                drawWidth = maxSide;
                drawHeight = minSide;
            } else {
                drawWidth = minSide;
                drawHeight = maxSide;
            }
        }
        var canvas = document.createElement('canvas');
        canvas.width = width = drawWidth;
        canvas.height = height = drawHeight;
        var context = canvas.getContext('2d');
        //判断图片方向，重置canvas大小，确定旋转角度，iphone默认的是home键在右方的横屏拍摄方式


        switch (dir) {
            case 3:
                degree = 180;
                drawWidth = -width;
                drawHeight = -height;
                break;
            //iphone竖屏拍摄，此时home键在下方(正常拿手机的方向)
            case 6:
                canvas.width = height;
                canvas.height = width;
                degree = 90;
                drawWidth = width;
                drawHeight = -height;
                break;
            //iphone竖屏拍摄，此时home键在上方
            case 8:
                canvas.width = height;
                canvas.height = width;
                degree = 270;
                drawWidth = -width;
                drawHeight = height;
                break;
        }
        //使用canvas旋转校正
        context.rotate(degree * Math.PI / 180);
        context.drawImage(this, 0, 0, drawWidth, drawHeight);
        //返回校正图片
        next(canvas.toDataURL("image/jpeg", .8));
    };
    image.src = img;
}

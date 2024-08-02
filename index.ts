
const { Image } = require('image-js');

let gx_matrix: Array<number>;
gx_matrix = [1, 0, -1]
let gy_matrix: Array<number>;
gy_matrix = [0, 0, -0];

function getPixelGrayValue(image, x: number, y: number): number {
    let pixel = image.getPixelXY(x, y);
    let C_linear = pixel[0] / 255 * 0.2126 + pixel[1] / 255 * 0.7152 + pixel[2] / 255 * 0.0722;
    if (C_linear <= 0.0031308)
        return C_linear * 12.92 * 255;
    else
        return 255 * (1.055 * Math.pow(C_linear, 1 / 2.4) - 0.055);
}

function convolute_gx(image, x: number, y: number): number {
    if (x > 0 && x < image.width - 1) {
        let res = 0;
        for (let i = -1; i < 2; ++i) {
            res += getPixelGrayValue(image, x + i, y) * gx_matrix[i + 1];
        }
        return res;
    }
    if (x == 0)
        return -3 * getPixelGrayValue(image, x, y) + 4 * getPixelGrayValue(image, x + 1, y) - getPixelGrayValue(image, x + 2, y);
    else
        return 3 * getPixelGrayValue(image, x, y) - 4 * getPixelGrayValue(image, x - 1, y) + getPixelGrayValue(image, x - 2, y);
}

function convolute_gy(image, x: number, y: number): number {
    if (y > 0 && y < image.height - 1) {
        let res = 0;
        for (let i = -1; i < 2; ++i) {
            res += getPixelGrayValue(image, x, y + i) * gy_matrix[i + 1];
        }
        return res;
    }
    if (y == 0)
        return -3 * getPixelGrayValue(image, x, y) + 4 * getPixelGrayValue(image, x, y + 1) - getPixelGrayValue(image, x, y + 2);
    else
        return 3 * getPixelGrayValue(image, x, y) - 4 * getPixelGrayValue(image, x, y - 1) + getPixelGrayValue(image, x, y - 2);
}

function energy(image, x: number, y: number): number {
    let gx = convolute_gx(image, x, y);
    let gy = convolute_gy(image, x, y);
    return Math.sqrt(gx * gx + gy * gy);
}

function getEnergyMap(image): Array<Array<number>> {
    let energyMap = [];
    for (let i = 0; i < image.width; i++) {
        let row = [];
        for (let j = 0; j < image.height; j++) {
            row.push(energy(image, i, j));
        }
        energyMap.push(row);
    }

    return energyMap;
}

function getMinSeam(energyMap): Array<number> {
    let minSeam: Array<number> = [];
    let dp: Array<Array<Array<number>>> = [];
    dp.push([]);
    for (let i = 0; i < energyMap[0].length; i++) {
        dp[0].push([energyMap[0][i], -1]);
    }
    for (let i = 1; i < energyMap.length; i++) {
        dp.push([]);
        for (let j = 0; j < energyMap[i].length; j++) {
            dp[i].push([Infinity, -1]);
            for (let k = -1; k <= 1; k++) {
                if (j + k >= 0 && j + k < energyMap[i].length) {
                    let newEnergy = dp[i - 1][j + k][0] + energyMap[i][j];
                    if (newEnergy < dp[i][j][0])
                        dp[i][j] = [newEnergy, j + k];
                }
            }
        }
    }
    let minSeamIndex = 0;
    for (let i = 1; i < energyMap[0].length; i++) {
        if (dp[energyMap.length - 1][i][0] < dp[energyMap.length - 1][minSeamIndex][0]) {
            minSeamIndex = i;
        }
    }
    minSeam.push(minSeamIndex);
    let curHeight = energyMap.length - 1;
    while (curHeight > 0) {
        minSeamIndex = dp[curHeight][minSeamIndex][1];
        minSeam.push(minSeamIndex);
        curHeight--;
    }
    minSeam.reverse();
    console.log(minSeam.slice(0, 15));
    return minSeam;
}

function createImageWithoutMinSeam(image, minSeam) {
    let newImage = new Image(image.width - 1, image.height);
    for (let i = 0; i < image.height; i++) {
        let index = 0;
        for (let j = 0; j < image.width; j++) {
            if (j != minSeam[i]) {
                let pixel = image.getPixelXY(j, i);
                newImage.setPixelXY(index, i, pixel);
                index++;
            }
        }
    }
    return newImage;
}

function removeSeam(image, seamCount: number) {
    let newImage = image;
    for (let i = 0; i < seamCount; i++) {
        let energyMap = getEnergyMap(newImage);
        let minSeam = getMinSeam(energyMap);
        newImage = createImageWithoutMinSeam(newImage, minSeam);
    }
    // newImage = image;
    // newImage.width = energyMap.length;
    // newImage.height = energyMap[0].length;
    // for (let y = 0; y < newImage.height; y++) {
    //     for (let x = 0; x < newImage.width; x++) {
    //         newImage.setPixelXY(x, y, [energyMap[x][y], energyMap[x][y], energyMap[x][y], 255])
    //     }
    // }
    return newImage;
}

function removeSeam_(image, seamCount: number) {
    let newImage = image;
    // for (let i = 0; i < seamCount; i++) {
        let energyMap = getEnergyMap(newImage);
    //     let minSeam = getMinSeam(energyMap);
    //     newImage = createImageWithoutMinSeam(newImage, minSeam);
    // }
    newImage = image;
    newImage.width = energyMap.length;
    newImage.height = energyMap[0].length;
    for (let y = 0; y < newImage.height; y++) {
        for (let x = 0; x < newImage.width; x++) {
            newImage.setPixelXY(x, y, [energyMap[x][y], energyMap[x][y], energyMap[x][y], 255])
        }
    }
    return newImage;
}


async function main() {
    const seamCount = 100;
    let image = await Image.load('input.png');
    let newImage = removeSeam(image, seamCount);
    newImage.save('output.png');
}

main().then(() => console.log("meow"));

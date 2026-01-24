"""
This module is responsible for extracting photos from 
various fonts within the fonts-main directory 
(sourced from Google Fonts)
https://github.com/google/fonts/tree/main
"""


# Sourcing from ofl fonts for now 
#   (it contains the majority of fonts)
import os

# Ignore fonts without METADATA.pb containing subsets: "latin"

# If there are multiple .ttf files in a font directory,
#   prefer the one with "Regular" in its name

import os
from PIL import Image, ImageDraw, ImageFont


def render_font_image(
    font_path,
    output_path,
    image_size=(224, 224),
    font_size=24
):
    # white background
    img = Image.new("L", image_size, color=255)
    draw = ImageDraw.Draw(img)

    font = ImageFont.truetype(font_path, font_size)

    text = (
        "The quick brown\n"
        "fox jumps over\n"
        "the lazy dog.\n"
        "ABCDEFG\n"
        "0123456789"
    )

    # center text
    bbox = draw.multiline_textbbox((0, 0), text, font=font, spacing=10)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    x = (image_size[0] - text_width) // 2
    y = (image_size[1] - text_height) // 2

    draw.multiline_text(
        (x, y),
        text,
        fill=0,
        font=font,
        spacing=10,
        align="center"
    )

    img.save(output_path)



i=0

for root, dirs, files in os.walk("datawork\\fonts-main\\ofl"):
    print(root, dirs, files)
    photo_path = None
    if 'METADATA.pb' in files:
        metadata_path = os.path.join(root, 'METADATA.pb')
        with open(metadata_path, 'r', encoding='utf-8') as f:
            metadata = f.read()
            # Filter for latin subset
            if 'subsets: "latin"' in metadata:
                ttf_files = [f for f in files if f.endswith('.ttf')]

                # TODO: Consider filtering out Symbol fonts here as well.

                if 'primary_script' not in metadata:

                    # If theere are tff files
                    if ttf_files:
                        preferred_file = None
                        # Prefer tff file with Regular in it's name.
                        for ttf in ttf_files:
                            if 'Regular' in ttf:
                                preferred_file = ttf
                                break
                        
                        # If we don't find Regular, just use the first tff file.
                        if not preferred_file:
                            preferred_file = ttf_files[0]
                        
                        photo_path = os.path.join(root, preferred_file)


        if photo_path != None:
            try:
                # Generate photo using the path (standardizing for font size, etc)
                render_font_image(
                    font_path=photo_path,
                    output_path=os.path.join(
                        "datawork/font-photos",
                        os.path.basename(root) + ".png"
                    ),
                    image_size=(512, 512),
                    font_size=64
                )
                print("PHOTO SAVED:", photo_path)

                # TODO: If embeddings aren't good with just images, gather metadata as a csv for use later.

            except Exception as e:
                print("ERROR RENDERING PHOTO:", e)

            # Save photo to datawork/font-photos named after the font
        else:
            print("ERROR NO PHOTO PATH / METADATA.pb. (Check if latin subset)")


print("IMAGES COMPLETE :)")
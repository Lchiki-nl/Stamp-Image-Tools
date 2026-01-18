# Background Removal API Reference

This document outlines the parameters available for the upstream Hugging Face Space used for server-side background removal.
**Upstream URL**: `https://lchiki-nl-ezstampify.hf.space/`

## API Endpoint

- **Gradio API Name**: `/inference`
- **Method**: POST

## Parameters

The API accepts 9 parameters. When calling via `fetch` or Cloudflare Functions, these mirror the underlying Gradio input components.

| Parameter      | Type          | Default     | Description                                                                                                                                |
| :------------- | :------------ | :---------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| **input_path** | `dict` (File) | Required    | Input image. Can be local path, URL, or base64.                                                                                            |
| **model**      | `string`      | `"u2net"`   | Model selection. <br>Options include: `u2net`, `isnet-general-use`, `isnet-anime`, `u2net_human_seg`, `birefnet-general`, `bria-rmbg` etc. |
| **param_2**    | `bool`        | `True`      | **Alpha matting**. Enables smooth edge processing.                                                                                         |
| **param_3**    | `float`       | `240`       | **Foreground threshold**. (0-255). Lower values preserve more weak foreground details.                                                     |
| **param_4**    | `float`       | `10`        | **Background threshold**. (0-255). Higher values aggressively remove background noise.                                                     |
| **param_5**    | `float`       | `40`        | **Erosion size**. <br>Shrinks the mask edge to remove "halos" (white fringes) around the subject.                                          |
| **param_6**    | `bool`        | `False`     | **Only mask**. If True, returns the black/white mask instead of transparent image.                                                         |
| **param_7**    | `bool`        | `True`      | **Post process mask**. Enables morphological operations to clean up noise (small dots).                                                    |
| **param_8**    | `string`      | `"Hello!!"` | **Arguments**. Arbitrary string argument (likely unused/debug).                                                                            |

## Client Usage Example (Python)

```python
from gradio_client import Client, handle_file

client = Client("https://lchiki-nl-ezstampify.hf.space/")
result = client.predict(
	input_path=handle_file('/path/to/image.png'),
	model="u2net",      # Model selection
	param_2=True,       # Alpha matting
	param_3=240,        # Foreground threshold
	param_4=10,         # Background threshold
	param_5=40,         # Erosion size (Halo removal)
	param_6=False,      # Return mask only?
	param_7=True,       # Post-process mask (Cleanup)
	param_8="Hello!!",  # Extra args
	api_name="/inference"
)
print(result) # Returns path to processed image
```

## Potential Future Features

Based on these parameters, the following features could be added to the UI in the future:

1. **Erosion Size Slider (`param_5`)**: To fix "white halo" issues around cutouts.
2. **Post Process Toggle (`param_7`)**: To toggle automatic noise cleanup.
3. **Advanced Model Selection**: Adding `birefnet-general` or `bria-rmbg` to the dropdown.

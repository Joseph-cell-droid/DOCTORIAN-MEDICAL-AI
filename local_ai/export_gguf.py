# GGUF Export Protocol for Local Deployment (Ollama/llama.cpp)
from unsloth import FastLanguageModel
import os

# 1. Load your fine-tuned model and adapters
model_name = "doctorian_llama3.1_adapters" # Path to your fine-tuned adapters
max_seq_length = 2048

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = model_name,
    max_seq_length = max_seq_length,
    load_in_4bit = True,
)

# 2. Export to GGUF
# You can choose different quantization methods:
# q4_k_m: Blazing fast speed, outstanding quality (Recommended for local/mobile CPUs)
# q8_0: Near lossless, 8-bit, requires more RAM
# f16: Lossless, large file size

output_path = "doctorian_llama3.1_intelligence_v1"

print(f"Exporting llama3.1 model to GGUF format ({output_path})...")

model.save_pretrained_gguf(
    output_path, 
    tokenizer, 
    quantization_method = "q4_k_m" # Using q4_k_m for lightning fast response times
)

# Optional: Push to HuggingFace
# model.push_to_hub_gguf("username/doctorian-pllama3.1-gguf", tokenizer, quantization_method = "q4_k_m", token = "HF_TOKEN")

print("Export Complete.")
print(f"To run in Ollama:")
print(f"1. Create a Modelfile:")
print(f"   FROM {output_path}/unsloth.Q4_K_M.gguf")
print(f"   SYSTEM \"You are Doctorian AI, a modern intelligent medical expert...\"")
print(f"2. Run: ollama create doctorian -f Modelfile")
print(f"3. Run: ollama run doctorian")

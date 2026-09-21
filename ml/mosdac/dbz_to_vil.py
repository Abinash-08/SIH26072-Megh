import xarray as xr
import numpy as np
import glob
import os


# ============================================================
# SELECT RADAR FILE
# ============================================================

files = sorted(
    glob.glob("raw/*06_42_36*.nc")
)

if not files:
    raise FileNotFoundError(
        "06:42 radar NetCDF file not found."
    )

file_path = files[0]

print("Using:", file_path)


# ============================================================
# LOAD DATA
# ============================================================

ds = xr.open_dataset(file_path)

print("\nDataset coordinates:")
print(ds.coords)

print("\nActual Latitude:")
print(
    float(ds["latitude"].values.min()),
    float(ds["latitude"].values.max())
)

print("\nActual Longitude:")
print(
    float(ds["longitude"].values.min()),
    float(ds["longitude"].values.max())
)

dbz = ds["DBZ"].isel(time=0).values.astype(np.float32)
heights = ds["height"].values.astype(np.float32)

print("DBZ shape:", dbz.shape)
print("Height levels:", len(heights))
print("Valid DBZ:", np.isfinite(dbz).sum())


# ============================================================
# DBZ → LINEAR REFLECTIVITY
#
# Z [mm^6 / m^3] = 10^(DBZ/10)
# ============================================================

valid = np.isfinite(dbz)

Z = np.zeros_like(dbz, dtype=np.float32)

Z[valid] = 10.0 ** (
    dbz[valid] / 10.0
)


# ============================================================
# RADAR-DERIVED VIL
#
# Standard approximation:
#
# VIL = 3.44e-6 ∫ Z^(4/7) dh
#
# Z  = linear radar reflectivity
# dh = vertical spacing in meters
#
# Result approximately kg/m²
# ============================================================

vil_integrand = np.zeros_like(
    Z,
    dtype=np.float32
)

vil_integrand[valid] = (
    Z[valid] ** (4.0 / 7.0)
)


vil = (
    3.44e-6
    * np.trapezoid(
        vil_integrand,
        x=heights,
        axis=0
    )
)


# ============================================================
# CLEAN
# ============================================================

vil = np.nan_to_num(
    vil,
    nan=0.0,
    posinf=0.0,
    neginf=0.0
).astype(np.float32)


# ============================================================
# STATISTICS
# ============================================================

print()
print("Radar-derived VIL")
print("------------------")
print("Shape:", vil.shape)
print("Min:", float(vil.min()))
print("Max:", float(vil.max()))
print("Mean:", float(vil.mean()))
print(
    "Non-zero pixels:",
    int(np.count_nonzero(vil))
)


# ============================================================
# SAVE
# ============================================================

os.makedirs(
    "processed",
    exist_ok=True
)

output_file = (
    "processed/"
    "vil_2018_09_07_06_42_36.npy"
)

np.save(
    output_file,
    vil
)

print()
print("Saved:", output_file)
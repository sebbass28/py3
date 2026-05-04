"""
Genera un modelo STL realista de corona dental.
Forma: cilindro con base gruesa + paredes que se estrechan + parte superior cóncava.
"""
import struct, math, os


def generate_dental_crown(filepath):
    """Crea un STL binario con forma de corona dental realista."""
    triangles = []

    def add_tri(n, v0, v1, v2):
        triangles.append((n, v0, v1, v2))

    def cross_normal(v0, v1, v2):
        ux, uy, uz = v1[0]-v0[0], v1[1]-v0[1], v1[2]-v0[2]
        vx, vy, vz = v2[0]-v0[0], v2[1]-v0[1], v2[2]-v0[2]
        nx = uy*vz - uz*vy
        ny = uz*vx - ux*vz
        nz = ux*vy - uy*vx
        ln = math.sqrt(nx*nx + ny*ny + nz*nz) or 1.0
        return (nx/ln, ny/ln, nz/ln)

    def add_quad(v0, v1, v2, v3):
        n1 = cross_normal(v0, v1, v2)
        n2 = cross_normal(v0, v2, v3)
        add_tri(n1, v0, v1, v2)
        add_tri(n2, v0, v2, v3)

    N = 64  # Segments around circumference

    # --- Crown profile (cross-section) ---
    # Each level: (z_height, outer_radius, inner_radius_or_None)
    # The crown has:
    #   - A hollow interior (like a real dental crown fits over a tooth)
    #   - Flared base margin
    #   - Bulging middle (equator)
    #   - Tapered occlusal (top) with cusps

    # Outer profile points (z, radius)
    outer_profile = [
        (0.0,  4.2),   # Base margin - slightly flared
        (0.3,  4.0),   # Just above margin
        (1.0,  4.3),   # Cervical bulge
        (2.0,  4.5),   # Maximum bulge (equator)
        (3.0,  4.4),   # Start tapering
        (4.0,  4.0),   # Upper body
        (4.5,  3.6),   # Near occlusal
        (5.0,  3.2),   # Occlusal table edge
        (5.3,  2.8),   # Cusp rise
        (5.6,  2.2),   # Cusp tip area
    ]

    # Inner profile (hollow interior - the part that sits on the tooth prep)
    inner_profile = [
        (0.0,  3.5),   # Base opening
        (0.3,  3.3),
        (1.0,  3.2),
        (2.0,  3.1),
        (3.0,  3.0),
        (4.0,  2.8),
        (4.5,  2.5),
        (5.0,  2.2),   # Interior ceiling
    ]

    def profile_point(angle, z, r):
        """Generate a point with slight organic variation."""
        # Add subtle bumps for realism
        variation = 1.0 + 0.03 * math.sin(angle * 5) + 0.02 * math.cos(angle * 3)
        # Add cusp-like bumps at the top
        cusp_bump = 0.0
        if z > 4.5:
            cusp_factor = (z - 4.5) / 1.1
            cusp_bump = 0.15 * cusp_factor * abs(math.sin(angle * 2.5))
        x = r * variation * math.cos(angle)
        y = r * variation * math.sin(angle)
        return (x, y, z + cusp_bump)

    # --- Build outer shell ---
    for i in range(len(outer_profile) - 1):
        z0, r0 = outer_profile[i]
        z1, r1 = outer_profile[i + 1]
        for j in range(N):
            a0 = 2 * math.pi * j / N
            a1 = 2 * math.pi * (j + 1) / N
            v0 = profile_point(a0, z0, r0)
            v1 = profile_point(a1, z0, r0)
            v2 = profile_point(a1, z1, r1)
            v3 = profile_point(a0, z1, r1)
            add_quad(v0, v1, v2, v3)

    # --- Build inner shell (reversed normals for hollow) ---
    for i in range(len(inner_profile) - 1):
        z0, r0 = inner_profile[i]
        z1, r1 = inner_profile[i + 1]
        for j in range(N):
            a0 = 2 * math.pi * j / N
            a1 = 2 * math.pi * (j + 1) / N
            v0 = profile_point(a0, z0, r0)
            v1 = profile_point(a1, z0, r0)
            v2 = profile_point(a1, z1, r1)
            v3 = profile_point(a0, z1, r1)
            # Reversed winding for inside-facing normals
            add_quad(v1, v0, v3, v2)

    # --- Bottom ring (connects outer to inner at base) ---
    z_base = 0.0
    r_out = outer_profile[0][1]
    r_in = inner_profile[0][1]
    for j in range(N):
        a0 = 2 * math.pi * j / N
        a1 = 2 * math.pi * (j + 1) / N
        vo0 = profile_point(a0, z_base, r_out)
        vo1 = profile_point(a1, z_base, r_out)
        vi0 = profile_point(a0, z_base, r_in)
        vi1 = profile_point(a1, z_base, r_in)
        # Bottom face (normals pointing down)
        add_quad(vo1, vo0, vi0, vi1)

    # --- Top surface (occlusal - connects outer to inner at top with concavity) ---
    # Create a concave occlusal surface
    z_top_outer = outer_profile[-1][0]
    r_top_outer = outer_profile[-1][1]
    z_top_inner = inner_profile[-1][0]
    r_top_inner = inner_profile[-1][1]

    # Intermediate ring for the concave fossa
    n_rings = 4
    for ring in range(n_rings):
        t0 = ring / n_rings
        t1 = (ring + 1) / n_rings
        # Interpolate radius
        r0 = r_top_outer + (r_top_inner - r_top_outer) * t0
        r1 = r_top_outer + (r_top_inner - r_top_outer) * t1
        # Create concave z profile (dip in the middle)
        z_dip0 = -0.4 * math.sin(t0 * math.pi)  # Parabolic dip
        z_dip1 = -0.4 * math.sin(t1 * math.pi)
        z0 = z_top_outer + z_dip0
        z1 = z_top_outer + z_dip1

        for j in range(N):
            a0 = 2 * math.pi * j / N
            a1 = 2 * math.pi * (j + 1) / N
            # Add cusp variation to the top surface
            cusp0_0 = 0.15 * abs(math.sin(a0 * 2.5)) * (1 - t0)
            cusp1_0 = 0.15 * abs(math.sin(a1 * 2.5)) * (1 - t0)
            cusp0_1 = 0.15 * abs(math.sin(a0 * 2.5)) * (1 - t1)
            cusp1_1 = 0.15 * abs(math.sin(a1 * 2.5)) * (1 - t1)

            v0 = (r0 * math.cos(a0), r0 * math.sin(a0), z0 + cusp0_0)
            v1 = (r0 * math.cos(a1), r0 * math.sin(a1), z0 + cusp1_0)
            v2 = (r1 * math.cos(a1), r1 * math.sin(a1), z1 + cusp1_1)
            v3 = (r1 * math.cos(a0), r1 * math.sin(a0), z1 + cusp0_1)
            add_quad(v0, v1, v2, v3)

    # --- Inner ceiling (flat cap at top of inner shell) ---
    center_top = (0.0, 0.0, z_top_inner)
    r_ceil = inner_profile[-1][1]
    for j in range(N):
        a0 = 2 * math.pi * j / N
        a1 = 2 * math.pi * (j + 1) / N
        v0 = (r_ceil * math.cos(a0), r_ceil * math.sin(a0), z_top_inner)
        v1 = (r_ceil * math.cos(a1), r_ceil * math.sin(a1), z_top_inner)
        n = cross_normal(center_top, v1, v0)
        add_tri(n, center_top, v1, v0)

    # --- Write binary STL ---
    with open(filepath, 'wb') as f:
        header = b'DentalLinkLab Crown Model' + b'\x00' * (80 - 25)
        f.write(header)
        f.write(struct.pack('<I', len(triangles)))
        for (n, v0, v1, v2) in triangles:
            f.write(struct.pack('<3f', *n))
            f.write(struct.pack('<3f', *v0))
            f.write(struct.pack('<3f', *v1))
            f.write(struct.pack('<3f', *v2))
            f.write(struct.pack('<H', 0))

    print(f"Generated {len(triangles)} triangles -> {filepath}  ({os.path.getsize(filepath)} bytes)")


if __name__ == '__main__':
    out = os.path.join(os.path.dirname(__file__), '..', 'static', 'models', 'Crown.stl')
    generate_dental_crown(os.path.abspath(out))

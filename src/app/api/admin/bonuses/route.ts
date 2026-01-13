import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { BonusType } from '@prisma/client';
import { getAdminSession } from '@/lib/adminAuth';

// GET - List bonuses
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const active = url.searchParams.get('active');

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (active !== null) {
      where.isActive = active === 'true';
    }

    const [bonuses, total] = await Promise.all([
      prisma.bonus.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { claims: true },
          },
        },
      }),
      prisma.bonus.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      bonuses: bonuses.map((b) => ({
        ...b,
        claimCount: b._count.claims,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('List bonuses error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch bonuses' }, { status: 500 });
  }
}

// POST - Create new bonus
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.type) {
      return NextResponse.json({ success: false, error: 'Name and type are required' }, { status: 400 });
    }

    // Validate bonus type
    const validTypes = Object.values(BonusType);
    if (!validTypes.includes(data.type)) {
      return NextResponse.json({ success: false, error: 'Invalid bonus type' }, { status: 400 });
    }

    // Check if code already exists
    if (data.code) {
      const existing = await prisma.bonus.findUnique({ where: { code: data.code } });
      if (existing) {
        return NextResponse.json({ success: false, error: 'Bonus code already exists' }, { status: 400 });
      }
    }

    const bonus = await prisma.bonus.create({
      data: {
        name: data.name,
        description: data.description,
        code: data.code || null,
        type: data.type,
        amount: data.amount ? parseFloat(data.amount) : null,
        percentage: data.percentage ? parseFloat(data.percentage) : null,
        maxBonus: data.maxBonus ? parseFloat(data.maxBonus) : null,
        minDeposit: data.minDeposit ? parseFloat(data.minDeposit) : null,
        wagerRequirement: data.wagerRequirement ? parseFloat(data.wagerRequirement) : 1,
        startsAt: data.startsAt ? new Date(data.startsAt) : new Date(),
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        usageLimit: data.usageLimit ? parseInt(data.usageLimit) : null,
        perUserLimit: data.perUserLimit ? parseInt(data.perUserLimit) : 1,
        vipLevelRequired: data.vipLevelRequired ? parseInt(data.vipLevelRequired) : null,
        isActive: data.isActive !== false,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        adminId: session.adminId,
        action: 'bonus.create',
        targetType: 'Bonus',
        targetId: bonus.id,
        details: { name: bonus.name, type: bonus.type, code: bonus.code },
        ipAddress: request.headers.get('x-forwarded-for'),
        userAgent: request.headers.get('user-agent'),
      },
    });

    return NextResponse.json({
      success: true,
      bonus,
    });
  } catch (error) {
    console.error('Create bonus error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create bonus' }, { status: 500 });
  }
}

// PUT - Update bonus
export async function PUT(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const data = await request.json();

    if (!data.id) {
      return NextResponse.json({ success: false, error: 'Bonus ID is required' }, { status: 400 });
    }

    const existing = await prisma.bonus.findUnique({ where: { id: data.id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Bonus not found' }, { status: 404 });
    }

    // Check code uniqueness if changed
    if (data.code && data.code !== existing.code) {
      const codeExists = await prisma.bonus.findUnique({ where: { code: data.code } });
      if (codeExists) {
        return NextResponse.json({ success: false, error: 'Bonus code already exists' }, { status: 400 });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.code !== undefined) updateData.code = data.code || null;
    if (data.amount !== undefined) updateData.amount = data.amount ? parseFloat(data.amount) : null;
    if (data.percentage !== undefined) updateData.percentage = data.percentage ? parseFloat(data.percentage) : null;
    if (data.maxBonus !== undefined) updateData.maxBonus = data.maxBonus ? parseFloat(data.maxBonus) : null;
    if (data.minDeposit !== undefined) updateData.minDeposit = data.minDeposit ? parseFloat(data.minDeposit) : null;
    if (data.wagerRequirement !== undefined) updateData.wagerRequirement = parseFloat(data.wagerRequirement);
    if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
    if (data.usageLimit !== undefined) updateData.usageLimit = data.usageLimit ? parseInt(data.usageLimit) : null;
    if (data.perUserLimit !== undefined) updateData.perUserLimit = parseInt(data.perUserLimit);
    if (data.vipLevelRequired !== undefined) updateData.vipLevelRequired = data.vipLevelRequired ? parseInt(data.vipLevelRequired) : null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const bonus = await prisma.bonus.update({
      where: { id: data.id },
      data: updateData,
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        adminId: session.adminId,
        action: 'bonus.update',
        targetType: 'Bonus',
        targetId: bonus.id,
        details: JSON.parse(JSON.stringify(updateData)),
        ipAddress: request.headers.get('x-forwarded-for'),
        userAgent: request.headers.get('user-agent'),
      },
    });

    return NextResponse.json({
      success: true,
      bonus,
    });
  } catch (error) {
    console.error('Update bonus error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update bonus' }, { status: 500 });
  }
}

// DELETE - Delete bonus
export async function DELETE(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Only SUPER_ADMIN can delete bonuses' }, { status: 403 });
    }

    const url = new URL(request.url);
    const bonusId = url.searchParams.get('id');

    if (!bonusId) {
      return NextResponse.json({ success: false, error: 'Bonus ID is required' }, { status: 400 });
    }

    // Check if there are active claims
    const activeClaims = await prisma.bonusClaim.count({
      where: {
        bonusId,
        status: { in: ['PENDING', 'ACTIVE'] },
      },
    });

    if (activeClaims > 0) {
      return NextResponse.json({
        success: false,
        error: `Cannot delete: ${activeClaims} active claims exist`,
      }, { status: 400 });
    }

    await prisma.bonus.delete({ where: { id: bonusId } });

    // Log the action
    await prisma.auditLog.create({
      data: {
        adminId: session.adminId,
        action: 'bonus.delete',
        targetType: 'Bonus',
        targetId: bonusId,
        ipAddress: request.headers.get('x-forwarded-for'),
        userAgent: request.headers.get('user-agent'),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Bonus deleted successfully',
    });
  } catch (error) {
    console.error('Delete bonus error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete bonus' }, { status: 500 });
  }
}

import { db } from '@/lib/db';
import Link from 'next/link';
import { Users, Search, Mail, Phone, MessageSquare, Building2, MapPin } from '@/components/Icons';
import { CONTACT_DESIGNATIONS } from '@/lib/types';

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const search = params.q || '';
  const designationFilter = params.designation || '';

  const where: any = {
    school: { archived: false },
  };

  if (search) {
    where.AND = [
      {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
          { school: { name: { contains: search, mode: 'insensitive' } } },
        ],
      },
    ];
  }

  if (designationFilter) {
    where.designation = designationFilter;
  }

  const contacts = await db.contact.findMany({
    where,
    include: {
      school: {
        select: { id: true, name: true, city: true, state: true, salesStage: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Contacts Directory</h1>
        <p className="text-xs text-slate-500 mt-1">
          Central management of active school principals, directors, and lab coordinators.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              name="q"
              defaultValue={search}
              placeholder="Search by contact name, email, phone, or school..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              name="designation"
              defaultValue={designationFilter}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Designations</option>
              {CONTACT_DESIGNATIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-colors shrink-0 cursor-pointer"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Contacts List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {contacts.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No Contacts Found</h3>
            <p className="text-xs text-slate-500">
              No active school contacts match your search parameters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="p-4">Contact Name</th>
                  <th className="p-4">Designation</th>
                  <th className="p-4">Associated School</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone / WhatsApp</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contacts.map((contact: any) => (
                  <tr key={contact.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        {contact.name}
                        {contact.isPrimary && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">
                            PRIMARY
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg font-medium">
                        {contact.designation}
                      </span>
                    </td>

                    <td className="p-4">
                      <Link
                        href={`/schools/${contact.school.id}`}
                        className="font-semibold text-slate-900 hover:text-blue-600 block"
                      >
                        {contact.school.name}
                      </Link>
                      <span className="text-[11px] text-slate-500">
                        {contact.school.city}, {contact.school.state}
                      </span>
                    </td>

                    <td className="p-4 text-slate-700">
                      {contact.email ? (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{contact.email}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">N/A</span>
                      )}
                    </td>

                    <td className="p-4 text-slate-700">
                      {contact.phone ? (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{contact.phone}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">N/A</span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <Link
                        href={`/schools/${contact.school.id}`}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-xl font-semibold transition-colors"
                      >
                        View School
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

from flask import url_for
from printers import Ricoh
from printers.ricoh import FatalError

from ricohapi.config import Config

class PrinterClient(object):
    user_attrs = {'mailaddress': 'email', 'id': 'id', 'name': 'name'}
    printer_index = 0

    def __init__(self, printer_index=0):
        self.printer_index = printer_index

    def get_users(self):
        with Ricoh(**Config.PRINTER_INVENTORY[self.printer_index]) as printer:
            for user in printer:
                yield self.user(user)

    def get_user(self, id, id_attr='mailaddress'):
        with Ricoh(**Config.PRINTER_INVENTORY[self.printer_index]) as printer:
            for user in printer:
                if getattr(user, id_attr) == id:
                    return self.user(user)

    def add_user(self, user):
        for p in Config.PRINTER_INVENTORY:
            with Ricoh(**p) as printer:
                printer.add_user(**user)

        return self.get_user(user['email'], 'mailaddress')

    def delete_user(self, id, id_attr='mailaddress'):
        for p in Config.PRINTER_INVENTORY:
            with Ricoh(**p) as printer:
                if id_attr == 'id':
                    try:
                        printer.delete_user(id)
                    except FatalError:
                        # User ID does not exist on this printer...
                        pass
                else:
                    for user in printer:
                        if getattr(user, id_attr) == id:
                            printer.delete_user(user.id)

    def user(self, user):
        ret = {v: getattr(user, k, None) for k, v in self.user_attrs.items()}
        ret['link'] = url_for('user', id=ret['email'])
        return ret
